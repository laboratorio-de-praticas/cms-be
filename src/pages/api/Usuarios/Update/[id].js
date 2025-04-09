import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import bcryptjs from 'bcryptjs';
import conectar_banco from '@/config/database';
import authMiddleware from '../../../../middleware/authMiddleware';

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
      return res.status(400).json({ mensagem: 'ID do usuário é obrigatório' });
    }

    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Validar campos obrigatórios
    const camposObrigatorios = ['nome', 'email_institucional', 'tipo_usuario'];
    for (const campo of camposObrigatorios) {
      if (!fields[campo]) {
        return res.status(400).json({ mensagem: `Campo ${campo} é obrigatório` });
      }
    }

    // Validar tipo de usuário
    const tiposValidos = ['aluno', 'professor', 'admin'];
    if (!tiposValidos.includes(fields.tipo_usuario)) {
      return res.status(400).json({ mensagem: 'Tipo de usuário inválido' });
    }

    // Validar formato do email institucional
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(fields.email_institucional)) {
      return res.status(400).json({ mensagem: 'Email institucional inválido' });
    }

    const db = await conectar_banco();

    // Verificar se o usuário existe
    const usuario = await db.get('SELECT * FROM Usuario WHERE id = ?', [id]);
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // Verificar se o email já está em uso por outro usuário
    const emailExistente = await db.get(
      'SELECT id FROM Usuario WHERE email_institucional = ? AND id != ?',
      [fields.email_institucional, id]
    );
    if (emailExistente) {
      return res.status(400).json({ mensagem: 'Email institucional já está em uso' });
    }

    // Processar foto do usuário
    let fotoUrl = usuario.foto;
    if (files.foto) {
      const file = files.foto[0];
      const ext = path.extname(file.originalFilename);
      const fileName = `${id}${ext}`;
      const filePath = path.join(process.cwd(), 'public', 'imgs', 'usuarios', fileName);
      
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.copyFile(file.filepath, filePath);
      fotoUrl = `/imgs/usuarios/${fileName}`;
    }

    // Hash da senha se fornecida
    let senhaHash = usuario.senha;
    if (fields.senha) {
      senhaHash = await bcryptjs.hash(fields.senha, 10);
    }

    // Atualizar usuário no banco
    await db.run(`
      UPDATE Usuario SET
        nome = ?,
        email_institucional = ?,
        tipo_usuario = ?,
        foto = ?,
        senha = ?
      WHERE id = ?
    `, [
      fields.nome,
      fields.email_institucional,
      fields.tipo_usuario,
      fotoUrl,
      senhaHash,
      id
    ]);

    // Se for aluno, atualizar dados do candidato
    if (fields.tipo_usuario === 'aluno') {
      const camposAluno = ['ra', 'turma', 'curso'];
      for (const campo of camposAluno) {
        if (!fields[campo]) {
          return res.status(400).json({ mensagem: `Campo ${campo} é obrigatório para alunos` });
        }
      }

      await db.run(`
        UPDATE Candidato SET
          ra = ?,
          turma = ?,
          curso = ?
        WHERE id_usuario = ?
      `, [
        fields.ra,
        fields.turma,
        fields.curso,
        id
      ]);
    }

    await db.close();

    return res.status(200).json({
      mensagem: 'Usuário atualizado com sucesso',
      dados: {
        id,
        nome: fields.nome,
        email_institucional: fields.email_institucional,
        tipo_usuario: fields.tipo_usuario,
        foto: fotoUrl,
        ...(fields.tipo_usuario === 'aluno' && {
          ra: fields.ra,
          turma: fields.turma,
          curso: fields.curso
        })
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
} 