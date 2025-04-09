import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import conectar_banco from '@/config/database';
import authMiddleware from '../../../../middleware/authMiddleware';
import { generateQRCode } from '../../../../utils/qrCodeGenerator';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  try {
    // Verificar autenticação
    const auth = await authMiddleware(req, res);
    if (!auth.success) {
      return res.status(401).json({ mensagem: auth.mensagem });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ mensagem: 'ID do projeto é obrigatório' });
    }

    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Validar campos obrigatórios
    const camposObrigatorios = ['nome_projeto', 'nome_equipe', 'tlr', 'turma', 'descricao', 'cea', 'area_atuacao'];
    for (const campo of camposObrigatorios) {
      if (!fields[campo]) {
        return res.status(400).json({ mensagem: `Campo ${campo} é obrigatório` });
      }
    }

    const db = await conectar_banco();

    // Verificar se o projeto existe
    const projeto = await db.get('SELECT * FROM Projetos WHERE id = ?', [id]);
    if (!projeto) {
      return res.status(404).json({ mensagem: 'Projeto não encontrado' });
    }

    // Processar imagem de capa
    let imagemCapaUrl = projeto.imagem_capa;
    if (files.imagem_capa) {
      const file = files.imagem_capa[0];
      const ext = path.extname(file.originalFilename);
      const fileName = `${id}${ext}`;
      const filePath = path.join(process.cwd(), 'public', 'imgs', 'projetos', 'capas', fileName);
      
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.copyFile(file.filepath, filePath);
      imagemCapaUrl = `/imgs/projetos/capas/${fileName}`;
    }

    // Atualizar projeto no banco
    await db.run(`
      UPDATE Projetos SET
        nome_projeto = ?,
        nome_equipe = ?,
        tlr = ?,
        turma = ?,
        descricao = ?,
        cea = ?,
        area_atuacao = ?,
        imagem_capa = ?
      WHERE id = ?
    `, [
      fields.nome_projeto,
      fields.nome_equipe,
      fields.tlr,
      fields.turma,
      fields.descricao,
      fields.cea,
      fields.area_atuacao,
      imagemCapaUrl,
      id
    ]);

    // Gerar novo QR Code se necessário
    const qrCodePath = path.join(process.cwd(), 'public', 'imgs', 'projetos', 'qrcodes', `${id}.png`);
    const qrCodeUrl = `/imgs/projetos/qrcodes/${id}.png`;
    const projectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/projetos/${id}`;
    await generateQRCode(projectUrl, qrCodePath);

    // Atualizar projeto com URL do QR Code
    await db.run('UPDATE Projetos SET qr_code = ? WHERE id = ?', [qrCodeUrl, id]);

    // Processar imagens adicionais
    const imagensUrls = [];
    if (files.imagens) {
      // Remover imagens antigas
      await db.run('DELETE FROM Imagens_Projeto WHERE id_projeto = ?', [id]);

      for (const file of files.imagens) {
        const ext = path.extname(file.originalFilename);
        const fileName = `${crypto.randomUUID()}${ext}`;
        const filePath = path.join(process.cwd(), 'public', 'imgs', 'projetos', 'Imagens_Projeto', fileName);
        
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.copyFile(file.filepath, filePath);
        
        const url = `/imgs/projetos/Imagens_Projeto/${fileName}`;
        imagensUrls.push(url);
        
        await db.run(`
          INSERT INTO Imagens_Projeto (id, id_projeto, url_imagem)
          VALUES (?, ?, ?)
        `, [crypto.randomUUID(), id, url]);
      }
    }

    await db.close();

    return res.status(200).json({
      mensagem: 'Projeto atualizado com sucesso',
      dados: {
        id,
        nome_projeto: fields.nome_projeto,
        nome_equipe: fields.nome_equipe,
        tlr: fields.tlr,
        turma: fields.turma,
        descricao: fields.descricao,
        cea: fields.cea,
        area_atuacao: fields.area_atuacao,
        imagem_capa: imagemCapaUrl,
        imagens: imagensUrls,
        qr_code: qrCodeUrl
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
}