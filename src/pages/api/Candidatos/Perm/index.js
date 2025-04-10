import sqlite3 from 'sqlite3';
import path from 'path';
import fsSync from 'fs';

const conectar_banco = () => {
  try {
    // Verifica se o banco de dados já existe
    const dbPath = path.join(process.cwd(), 'src', 'database', 'cms_db.sqlite3');
    const dbExists = fsSync.existsSync(dbPath);
    
    // Conecta ao banco de dados existente ou cria um novo
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
  if (req.method !== 'PATCH') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    console.log('Processando alteração de status de candidatura...');
    
    // Parse do corpo da requisição JSON
    const { ra, status } = req.body;

    // Validações básicas
    if (!ra || !status) {
      console.log('Campos obrigatórios faltando:', { ra: !ra, status: !status });
      return res.status(400).json({ 
        erro: 'Campos obrigatórios faltando',
        campos_faltando: { ra: !ra, status: !status }
      });
    }

    if (!['aprovado', 'rejeitado'].includes(status)) {
      console.log('Status inválido:', status);
      return res.status(400).json({ 
        erro: 'Status inválido', 
        mensagem: "Use 'aprovado' ou 'rejeitado'",
        status_recebido: status
      });
    }

    // Conectar ao banco de dados
    console.log('Conectando ao banco de dados...');
    db = conectar_banco();
    console.log('Banco de dados conectado');

    // Verificar se candidato existe
    console.log('Verificando se candidato existe...');
    const candidato = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM Candidatos WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            console.error("Erro ao buscar candidato:", err);
            reject(err);
          }
          resolve(row);
        }
      );
    });

    if (!candidato) {
      db.close();
      return res.status(404).json({ mensagem: "Candidato não encontrado" });
    }

    // Verificar se o candidato está aprovado
    if (candidato.status_candidatura !== 'aprovado') {
      db.close();
      return res.status(400).json({ mensagem: "Apenas candidatos aprovados podem ter QR Code gerado" });
    }

    db.close();
    console.log("Conexão com o banco fechada");

    return res.status(200).json({
      mensagem: "Status atualizado com sucesso!"
    });

  } catch (erro) {
    console.error('Erro ao atualizar status da candidatura:', erro);
    
    if (db) {
      db.close();
    }

    return res.status(500).json({ 
      erro: 'Erro ao atualizar status da candidatura',
      detalhes: process.env.NODE_ENV === 'development' ? erro.message : undefined
    });
  }
}
