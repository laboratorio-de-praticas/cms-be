import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';

export const config = {
  api: {
    bodyParser: false,
  },
};

const conectar_banco = () => {
  try {
    const dbPath = path.join(process.cwd(), 'src', 'database', 'cms_db.sqlite3');
    const dbExists = fsSync.existsSync(dbPath);
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar/criar banco de dados:', err);
        throw err;
      }
      console.log(dbExists ? 'Conectado ao banco de dados existente' : 'Novo banco de dados criado');
    });
    
    return db;
  } catch (erro) {
    console.error('Erro ao conectar ao banco de dados:', erro);
    throw erro;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    console.log('Iniciando processamento do formulário...');
    
    await fs.mkdir(path.join(process.cwd(), 'public/imgs/candidatos'), { recursive: true });
    console.log('Diretório de imgs criado/verificado');

    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'public/imgs/candidatos'),
      keepExtensions: true,
    });

    console.log('Iniciando parse do form-data...');
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Erro no parse do form-data:', err);
          reject(err);
        }
        console.log('Form-data parseado com sucesso');
        resolve([fields, files]);
      });
    });

    const dadosJSON = fields.dados ? JSON.parse(fields.dados) : {};

    const ra = dadosJSON.ra || '';
    const nome = dadosJSON.nome || '';
    const email_institucional = dadosJSON.email_institucional || '';
    const telefone = dadosJSON.telefone || '';
    const senha = dadosJSON.senha || '';
    const turma_atual = dadosJSON.turma_atual || '';
    const deseja_ser_candidato = dadosJSON.deseja_ser_candidato || 'false';
    const link_video = dadosJSON.link_video || '';
    const descricao_campanha = dadosJSON.descricao_campanha || '';
    const curso = dadosJSON.curso || '';
    const semestre = dadosJSON.semestre || '';
    const ano_ingresso = dadosJSON.ano_ingresso || '';

    console.log('Campos recebidos:', fields);
    console.log('Arquivos recebidos:', files);

    if (!ra || !nome || !email_institucional || !telefone || !senha || !turma_atual || !curso || !semestre || !ano_ingresso) {
      console.log('Campos obrigatórios faltando:', {
        ra: !ra,
        nome: !nome,
        email_institucional: !email_institucional,
        telefone: !telefone,
        senha: !senha,
        turma_atual: !turma_atual,
        curso: !curso,
        semestre: !semestre,
        ano_ingresso: !ano_ingresso
      });
      return res.status(400).json({ 
        erro: 'Campos obrigatórios faltando',
        campos_faltando: {
            ra: !ra,
            nome: !nome,
            email_institucional: !email_institucional,
            telefone: !telefone,
            senha: !senha,
            turma_atual: !turma_atual,
            curso: !curso,
            semestre: !semestre,
            ano_ingresso: !ano_ingresso
          }
      });
    }

    if (!email_institucional.endsWith('@fatec.sp.gov.br')) {
      console.log('Email institucional inválido:', email_institucional);
      return res.status(400).json({ 
        erro: 'Email institucional inválido',
        mensagem: 'O email deve terminar com @fatec.sp.gov.br',
        email_recebido: email_institucional,
        email_esperado: 'seu.nome@fatec.sp.gov.br'
      });
    }

    console.log('Conectando ao banco de dados...');
    db = conectar_banco();
    console.log('Banco de dados conectado');

    console.log('Verificando estrutura da tabela Candidatos...');
    await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Candidatos'", (err, row) => {
        if (err) {
          console.error('Erro ao verificar tabela:', err);
          reject(err);
        }
        if (!row) {
          console.log('Tabela Candidatos não existe, criando...');
          db.run(`
            CREATE TABLE IF NOT EXISTS Candidatos (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              ra TEXT UNIQUE NOT NULL,
              email_institucional TEXT UNIQUE NOT NULL,
              telefone TEXT NOT NULL,
              senha TEXT NOT NULL,
              nome TEXT NOT NULL,
              turma_atual TEXT NOT NULL,
              foto TEXT,
              deseja_ser_candidato INTEGER DEFAULT 0,
              link_video TEXT,
              descricao_campanha TEXT,
              curso TEXT NOT NULL,
              semestre TEXT NOT NULL,
              ano_ingresso TEXT NOT NULL,
              status_candidatura TEXT
            )
          `, (err) => {
            if (err) {
              console.error('Erro ao criar tabela:', err);
              reject(err);
            }
            console.log('Tabela Candidatos criada com sucesso');
            resolve();
          });
        } else {
          console.log('Tabela Candidatos já existe');
          resolve();
        }
      });
    });

    console.log('Verificando se candidato já existe...');
    const candidato_existente = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM Candidatos WHERE ra = ? OR email_institucional = ?',
        [ra, email_institucional],
        (err, row) => {
          if (err) {
            console.error('Erro ao verificar candidato existente:', err);
            reject(err);
          }
          resolve(row);
        }
      );
    });

    if (candidato_existente) {
      console.log('Candidato já existe:', candidato_existente);
      return res.status(409).json({ 
        erro: 'Candidato já cadastrado',
        conflito: candidato_existente.ra === ra ? 'RA já existe' : 'Email já cadastrado'
      });
    }

    let foto_path = '/imgs/default-profile.jpg';
    if (files.foto) {
      console.log('Processando foto...');
      
      const arquivo = Array.isArray(files.foto) ? files.foto[0] : files.foto;
      
      if (!arquivo || !arquivo.mimetype || !arquivo.filepath) {
        console.log('Arquivo inválido:', arquivo);
        return res.status(400).json({ erro: 'Arquivo inválido. Por favor, tente novamente.' });
      }
      
      const tipos_permitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!tipos_permitidos.includes(arquivo.mimetype)) {
        console.log('Tipo de arquivo não permitido:', arquivo.mimetype);
        if (arquivo.filepath && fsSync.existsSync(arquivo.filepath)) {
          await fs.unlink(arquivo.filepath);
        }
        return res.status(400).json({ erro: 'Tipo de arquivo não permitido. Use apenas JPG, PNG, GIF ou WEBP.' });
      }

      const tamanho_maximo = 5 * 1024 * 1024;
      if (arquivo.size > tamanho_maximo) {
        console.log('Arquivo muito grande:', arquivo.size);
        if (arquivo.filepath && fsSync.existsSync(arquivo.filepath)) {
          await fs.unlink(arquivo.filepath);
        }
        return res.status(400).json({ erro: 'Arquivo muito grande. Tamanho máximo permitido: 5MB' });
      }

      const nome_arquivo = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(arquivo.originalFilename)}`;
      
      const caminho_final = path.join(process.cwd(), 'public/imgs/candidatos', nome_arquivo);
      await fs.rename(arquivo.filepath, caminho_final);
      
      foto_path = `/imgs/candidatos/${nome_arquivo}`;
      console.log('Foto processada com sucesso:', foto_path);
    }

    console.log('Criptografando senha...');
    const senha_hash = await bcrypt.hash(senha, 10);
    console.log('Senha criptografada');

    console.log('Inserindo candidato no banco...');
    await new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO Candidatos (
        ra, email_institucional, telefone, senha, nome, turma_atual, foto, 
        deseja_ser_candidato, link_video, descricao_campanha, curso, semestre, ano_ingresso, status_candidatura
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [
        ra,
        email_institucional,
        telefone,
        senha_hash,
        nome,
        turma_atual,
        foto_path,
        deseja_ser_candidato === 'true' ? 1 : 0,
        link_video || null,
        descricao_campanha || null,
        curso,
        semestre,
        ano_ingresso,
        deseja_ser_candidato === 'true' ? 'pendente' : null
      ], (err) => {
        if (err) {
          console.error('Erro ao inserir candidato:', err);
          reject(err);
        }
        console.log('Candidato inserido com sucesso');
        resolve();
      });
    });

    db.close();
    console.log('Conexão com o banco fechada');

    return res.status(201).json({ 
      mensagem: 'Candidato registrado com sucesso!',
      dados: { ra, nome, email: email_institucional }
    });

  } catch (erro) {
    console.error('Erro ao cadastrar candidato:', erro);
    
    if (db) {
      db.close();
    }

    return res.status(500).json({ 
      erro: 'Erro ao cadastrar candidato',
      detalhes: process.env.NODE_ENV === 'development' ? erro.message : undefined
    });
  }
}