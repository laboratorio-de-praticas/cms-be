import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

export const config = {
  api: {
    bodyParser: true,
  },
};

const conectar_banco = () => {
  const dbPath = path.join(process.cwd(), 'src', 'database', 'cms_db.sqlite3');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Erro ao conectar/criar banco de dados:', err);
      throw err;
    }
    console.log('Conectado ao banco de dados');
  });
  return db;
};

export default async function handler(req, res) {
 //
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { nome, telefone, senha, cidade, avaliador_tecnico } = req.body;

  if (!nome || !telefone || !senha || !cidade) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  const db = conectar_banco();

  try {
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS Visitantes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        cidade TEXT NOT NULL,
        avaliador_tecnico INTEGER DEFAULT 0
      )`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const visitante_existente = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM Visitantes WHERE telefone = ?', [telefone], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (visitante_existente) {
      return res.status(409).json({ erro: 'Telefone já cadastrado' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO Visitantes (nome, telefone, senha, cidade) VALUES (?, ?, ?, ?)',
        [nome, telefone, senha_hash, cidade],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    db.close();
    return res.status(201).json({ mensagem: 'Visitante cadastrado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao cadastrar visitante:', erro);
    db.close();
    return res.status(500).json({ erro: 'Erro ao cadastrar visitante' });
  }
}
