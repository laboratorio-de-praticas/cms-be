import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import bcryptjs from 'bcryptjs';
import conectar_banco from '@/config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  let db;
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ mensagem: auth.mensagem });
    // }

    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Função auxiliar para obter o valor do campo
    const getFieldValue = (field) => {
      if (!fields[field]) return '';
      const valor = Array.isArray(fields[field]) ? fields[field][0] : fields[field];
      return String(valor || '');
    };

    // Validar campos obrigatórios
    const camposObrigatorios = ['nome', 'email_institucional', 'senha', 'tipo_usuario', 'telefone'];
    for (const campo of camposObrigatorios) {
      const valor = getFieldValue(campo);
      if (!valor || valor.trim() === '') {
        return res.status(400).json({ mensagem: `Campo ${campo} é obrigatório` });
      }
    }

    // Validar tipo de usuário
    const tiposValidos = ['aluno', 'professor', 'admin'];
    if (!tiposValidos.includes(getFieldValue('tipo_usuario'))) {
      return res.status(400).json({ mensagem: 'Tipo de usuário inválido' });
    }

    // Validar formato do email institucional
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(getFieldValue('email_institucional'))) {
      return res.status(400).json({ mensagem: 'Email institucional inválido' });
    }

    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Verificar se o email já está em uso
    const emailExistente = await db.get(
      'SELECT id_usuario FROM Usuario WHERE email_institucional = ?',
      [getFieldValue('email_institucional')]
    );
    console.log('Email verificado:', {
      email: getFieldValue('email_institucional'),
      existe: !!emailExistente,
      dados: emailExistente
    });

    if (emailExistente && emailExistente.id_usuario) {
      return res.status(400).json({ 
        erro: 'Email institucional já está em uso',
        detalhes: {
          email: getFieldValue('email_institucional'),
          id_existente: emailExistente.id_usuario
        }
      });
    }

    // Processar foto do usuário
    let fotoUrl = null;
    if (files.foto && files.foto[0]) {
      const file = files.foto[0];
      const ext = path.extname(file.originalFilename);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
      const filePath = path.join(process.cwd(), 'public', 'imgs', 'usuarios', fileName);
      
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.copyFile(file.filepath, filePath);
      fotoUrl = `/imgs/usuarios/${fileName}`;
    }

    // Hash da senha
    const senhaHash = await bcryptjs.hash(getFieldValue('senha'), 10);

    // Iniciar transação
    await db.run('BEGIN TRANSACTION');

    try {
      // Inserir usuário no banco
      const stmtUsuario = await db.prepare(`
        INSERT INTO Usuario (
          nome, email_institucional, senha, tipo_usuario, foto, telefone
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      await stmtUsuario.run(
        getFieldValue('nome').trim(),
        getFieldValue('email_institucional').trim(),
        senhaHash,
        getFieldValue('tipo_usuario'),
        fotoUrl,
        getFieldValue('telefone').trim()
      );
      await stmtUsuario.finalize();

      // Obter o ID do usuário inserido
      const id_usuario = await new Promise((resolve, reject) => {
        db.get('SELECT last_insert_rowid() as id', (err, row) => {
          if (err) reject(err);
          resolve(row.id);
        });
      });

      // Se for aluno, inserir dados do candidato
      if (getFieldValue('tipo_usuario') === 'aluno') {
        const camposAluno = ['ra', 'turma_atual'];
        for (const campo of camposAluno) {
          const valor = getFieldValue(campo);
          if (!valor || valor.trim() === '') {
            await db.run('ROLLBACK');
            return res.status(400).json({ erro: `Campo ${campo} é obrigatório para alunos` });
          }
        }

        const stmtCandidato = await db.prepare(`
          INSERT INTO Candidato (
            id_usuario, ra, turma_atual, deseja_ser_candidato
          ) VALUES (?, ?, ?, ?)
        `);

        try {
          await stmtCandidato.run(
            id_usuario,
            parseInt(getFieldValue('ra')),
            getFieldValue('turma_atual').trim(),
            false
          );
          await stmtCandidato.finalize();
        } catch (error) {
          await db.run('ROLLBACK');
          console.error('Erro ao criar candidato:', error);
          throw error;
        }
      }

      // Commit da transação
      await db.run('COMMIT');

      return res.status(201).json({
        mensagem: 'Usuário criado com sucesso',
        dados: {
          id_usuario,
          nome: getFieldValue('nome').trim(),
          email_institucional: getFieldValue('email_institucional').trim(),
          tipo_usuario: getFieldValue('tipo_usuario'),
          foto: fotoUrl,
          telefone: getFieldValue('telefone').trim()
        }
      });

    } catch (error) {
      await db.run('ROLLBACK');
      console.error('Erro ao criar usuário:', error);
      throw error;
    }

  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({ 
      mensagem: 'Erro interno do servidor',
      erro: error.message 
    });
  } finally {
    if (db) {
      await db.close();
      console.log('Conexão com o banco fechada');
    }
  }
} 