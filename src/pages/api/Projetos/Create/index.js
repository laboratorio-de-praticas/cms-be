import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import conectar_banco from '@/config/database';
import authMiddleware from '@/middleware/authMiddleware';

// Configuração para permitir o parsing do form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

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
    let imagem_capa = '/imgs/projetos/capa/padrao.png';
    if (files.capa && files.capa[0]) {
      const capa = files.capa[0];
      const extensao = path.extname(capa.originalFilename);
      const nomeArquivo = `${crypto.randomUUID()}${extensao}`;
      const caminhoArquivo = path.join(process.cwd(), 'public', 'imgs', 'projetos', 'capa', nomeArquivo);
      
      await fs.mkdir(path.dirname(caminhoArquivo), { recursive: true });
      await fs.copyFile(capa.filepath, caminhoArquivo);
      
      imagem_capa = `/imgs/projetos/capa/${nomeArquivo}`;
    }

    console.log('Iniciando inserção do projeto no banco');
    const stmt = await db.prepare(`
      INSERT INTO Projetos (
        nome_projeto, nome_equipe, tlr, imagem_capa, turma, 
        descricao, cea, area_atuacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      const result = await stmt.run(
        fields.nome_projeto,
        fields.nome_equipe,
        fields.tlr,
        imagem_capa,
        fields.turma,
        fields.descricao,
        fields.cea,
        fields.area_atuacao
      );

      await stmt.finalize();
      console.log('Projeto inserido com sucesso:', result);

      const id_projeto = result.lastID;
      console.log('ID do projeto:', id_projeto);

      // Processar imagens adicionais
      if (files.imagens && files.imagens.length > 0) {
        for (const imagem of files.imagens) {
          const extensao = path.extname(imagem.originalFilename);
          const nomeArquivo = `${crypto.randomUUID()}${extensao}`;
          const caminhoArquivo = path.join(process.cwd(), 'public', 'imgs', 'projetos', 'imagens', nomeArquivo);
          
          await fs.mkdir(path.dirname(caminhoArquivo), { recursive: true });
          await fs.copyFile(imagem.filepath, caminhoArquivo);
          
          const imagemUrl = `/imgs/projetos/imagens/${nomeArquivo}`;
          await db.run(
            'INSERT INTO ImagensProjeto (projeto_id, imagem_url) VALUES (?, ?)',
            [id_projeto, imagemUrl]
          );
        }
      }

      // Buscar o projeto inserido para confirmar
      const projetoInserido = await db.get(
        'SELECT * FROM Projetos WHERE id_projeto = ?',
        [id_projeto]
      );

      if (!projetoInserido) {
        throw new Error('Projeto não foi encontrado após inserção');
      }

      console.log('Projeto confirmado no banco:', projetoInserido);

      return res.status(201).json({
        mensagem: 'Projeto criado com sucesso',
        projeto: {
          id_projeto,
          nome_projeto: fields.nome_projeto,
          nome_equipe: fields.nome_equipe,
          tlr: fields.tlr,
          turma: fields.turma,
          cea: fields.cea,
          area_atuacao: fields.area_atuacao,
          imagem_capa,
        }
      });

    } catch (error) {
      console.error('Erro ao inserir projeto:', error);
      throw error;
    }

  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: error.message 
    });
  } finally {
    if (db) {
      await db.close();
      console.log('Conexão com o banco fechada');
    }
  }
}

export default authMiddleware(handler);
