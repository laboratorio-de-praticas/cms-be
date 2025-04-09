import conectar_banco from '@/config/database';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { email_institucional, senha } = req.body;

  if (!email_institucional || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  const db = conectar_banco();
  const usuario = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM Usuario WHERE email_institucional = ?', [email_institucional], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });

  if (!usuario) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const senhaValida = await bcryptjs.compare(senha, usuario.senha);
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const token = jwt.sign(
    { 
      id: usuario.id,
      email_institucional: usuario.email_institucional,
      tipo_usuario: usuario.tipo_usuario
    }, 
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  // Buscar dados adicionais se for aluno
  let dadosAdicionais = {};
  if (usuario.tipo_usuario === 'aluno') {
    const candidato = await new Promise((resolve, reject) => {
      db.get('SELECT ra, turma, curso FROM Candidato WHERE id_usuario = ?', [usuario.id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
    if (candidato) {
      dadosAdicionais = candidato;
    }
  }

  return res.status(200).json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email_institucional: usuario.email_institucional,
      tipo_usuario: usuario.tipo_usuario,
      foto: usuario.foto,
      ...dadosAdicionais
    }
  });
} 