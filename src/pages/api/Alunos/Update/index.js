import { conectar_banco } from '@/config/database';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { 
    id_aluno,
    nome,
    email_institucional,
    curso_semestre,
    telefone,
    ra,
    data_matricula,
    foto_url 
  } = req.body;

  if (!id_aluno) {
    return res.status(400).json({ mensagem: 'ID do aluno não fornecido' });
  }

  const client = await conectar_banco();

  try {
    // Validações básicas
    if (!nome || !email_institucional || !curso_semestre || !ra) {
      return res.status(400).json({ 
        mensagem: 'Campos obrigatórios faltando',
        campos_necessarios: ['nome', 'email_institucional', 'curso_semestre', 'ra']
      });
    }

    // Verifica se o aluno existe
    const alunoExistente = await client.query(
      'SELECT * FROM "Alunos" WHERE id_aluno = $1',
      [id_aluno]
    );

    if (alunoExistente.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    }

    // Atualiza o aluno e o usuário associado
    await client.query('BEGIN');
    
    // 1. Atualiza a tabela Alunos
    const updateAluno = await client.query(`
      UPDATE "Alunos"
      SET 
        ra = $1,
        curso_semestre = $2,
        data_matricula = $3,
        foto_url = $4
      WHERE id_aluno = $5
      RETURNING *
    `, [ra, curso_semestre, data_matricula, foto_url || null, id_aluno]);

    // 2. Atualiza a tabela Usuarios
    const updateUsuario = await client.query(`
      UPDATE "Usuarios"
      SET 
        nome = $1,
        email_institucional = $2,
        telefone = $3
      WHERE id = $4
      RETURNING *
    `, [nome, email_institucional, telefone, alunoExistente.rows[0].fk_id_usuario]);

    await client.query('COMMIT');

    return res.status(200).json({
      mensagem: 'Aluno atualizado com sucesso',
      aluno: {
        ...updateAluno.rows[0],
        ...updateUsuario.rows[0]
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar aluno:', error);
    return res.status(500).json({
      mensagem: 'Erro ao atualizar aluno',
      detalhes: error.message
    });
  } finally {
    client.release();
  }
}