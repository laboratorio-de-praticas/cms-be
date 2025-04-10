import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import conectar_banco from '@/config/database';
import authMiddleware from '../../../../middleware/authMiddleware';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { id } = req.query;
  let db;

  try {
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Validação dos campos obrigatórios
    const camposObrigatorios = ['nome_projeto', 'nome_equipe', 'tlr', 'turma', 'descricao', 'cea', 'area_atuacao'];
    for (const campo of camposObrigatorios) {
      if (!fields[campo]) {
        return res.status(400).json({ erro: `Campo ${campo} é obrigatório` });
      }
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Processar imagem de capa
    let imagemCapaUrl = null;
    if (files.capa && files.capa[0]) {
      const capa = files.capa[0];
      const extensao = path.extname(capa.originalFilename);
      const nomeArquivo = `${crypto.randomUUID()}${extensao}`;
      const caminhoArquivo = path.join(process.cwd(), 'public', 'imgs', 'projetos', 'capa', nomeArquivo);
      
      await fs.mkdir(path.dirname(caminhoArquivo), { recursive: true });
      await fs.copyFile(capa.filepath, caminhoArquivo);
      
      imagemCapaUrl = `/imgs/projetos/capa/${nomeArquivo}`;
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
    console.log('Conexão com o banco fechada');

    return res.status(200).json({
      mensagem: 'Projeto atualizado com sucesso',
      projeto: {
        id,
        nome_projeto: fields.nome_projeto,
        nome_equipe: fields.nome_equipe,
        tlr: fields.tlr,
        turma: fields.turma,
        descricao: fields.descricao,
        cea: fields.cea,
        area_atuacao: fields.area_atuacao,
        imagem_capa: imagemCapaUrl,
        imagens: imagensUrls
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: error.message 
    });
  } finally {
    if (db) {
      await db.close();
    }
  }
}

export default authMiddleware(handler);