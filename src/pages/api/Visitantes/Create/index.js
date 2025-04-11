import conectar_banco from '@/config/database';
import bcrypt from 'bcryptjs';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { nome, telefone, senha, cidade, avaliador_tecnico } = req.body;

  if (!nome || !telefone || !senha || !cidade) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  let db;
  try {
    db = await conectar_banco();
    console.log('Banco de dados conectado');

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
        'INSERT INTO Visitantes (nome, telefone, senha, cidade, avaliador_tecnico) VALUES (?, ?, ?, ?, ?)',
        [nome, telefone, senha_hash, cidade, avaliador_tecnico || 0],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return res.status(201).json({ mensagem: 'Visitante cadastrado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao cadastrar visitante:', erro);
    return res.status(500).json({ erro: 'Erro ao cadastrar visitante' });
  } finally {
    if (db) {
      await db.close();
      console.log('Conexão com o banco fechada');
    }
  }
}