import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import bcryptjs from 'bcryptjs';
import conectar_banco from '@/config/database';
import { generateQRCode } from '../../../../utils/qrCodeGenerator';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  try {
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Validar campos obrigatórios
    const camposObrigatorios = ['nome', 'email_institucional', 'senha', 'tipo_usuario'];
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

    // Verificar se o email já está em uso
    const emailExistente = await db.get(
      'SELECT id FROM Usuario WHERE email_institucional = ?',
      [fields.email_institucional]
    );
    if (emailExistente) {
      return res.status(400).json({ mensagem: 'Email institucional já está em uso' });
    }

    // Processar foto do usuário
    let fotoUrl = null;
    if (files.foto) {
      const file = files.foto[0];
      const ext = path.extname(file.originalFilename);
      const fileName = `${crypto.randomUUID()}${ext}`;
      const filePath = path.join(process.cwd(), 'public', 'imgs', 'usuarios', fileName);
      
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.copyFile(file.filepath, filePath);
      fotoUrl = `/imgs/usuarios/${fileName}`;
    }

    // Hash da senha
    const senhaHash = await bcryptjs.hash(fields.senha, 10);

    // Inserir usuário no banco
    const id = crypto.randomUUID();
    await db.run(`
      INSERT INTO Usuario (
        id, nome, email_institucional, senha, tipo_usuario, foto
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      id,
      fields.nome,
      fields.email_institucional,
      senhaHash,
      fields.tipo_usuario,
      fotoUrl
    ]);

    // Se for aluno, inserir dados do candidato
    if (fields.tipo_usuario === 'aluno') {
      const camposAluno = ['ra', 'turma', 'curso'];
      for (const campo of camposAluno) {
        if (!fields[campo]) {
          return res.status(400).json({ mensagem: `Campo ${campo} é obrigatório para alunos` });
        }
      }

      await db.run(`
        INSERT INTO Candidato (
          id, id_usuario, ra, turma, curso
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        crypto.randomUUID(),
        id,
        fields.ra,
        fields.turma,
        fields.curso
      ]);
    }

    await db.close();

    return res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      dados: {
        id,
        nome: fields.nome,
        email_institucional: fields.email_institucional,
        tipo_usuario: fields.tipo_usuario,
        foto: fotoUrl
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ 
      mensagem: 'Erro interno do servidor',
      erro: error.message 
    });
  }
} 