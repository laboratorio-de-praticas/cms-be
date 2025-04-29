import { conectar_banco } from '../../../../config/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { fk_id_usuario, ra, curso_semestre, deseja_ser_candidato, foto_url, data_matricula } = req.body;

  // Verificação de campos obrigatórios
  if (!fk_id_usuario || !ra || !curso_semestre || !data_matricula) {
    return res.status(400).json({
      mensagem: 'Campos obrigatórios não fornecidos',
      campos_necessarios: ['fk_id_usuario', 'ra', 'curso_semestre', 'data_matricula']
    });
  }

  const client = await conectar_banco();

  try {
    await client.query('BEGIN');

    // Verifica se o usuário existe e é do tipo Interno
    const usuarioExistente = await client.query(
      `SELECT * FROM "Usuarios" WHERE id = $1 AND tipo_usuario = 'Interno'`,
      [fk_id_usuario]
    );

    if (usuarioExistente.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        mensagem: 'Usuário não encontrado ou não é do tipo Interno',
        detalhes: 'O ID de usuário fornecido deve pertencer a um usuário do tipo Interno'
      });
    }

    // Verifica se o aluno já está cadastrado
    const alunoExistente = await client.query(
      'SELECT * FROM "Alunos" WHERE fk_id_usuario = $1',
      [fk_id_usuario]
    );

    if (alunoExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        mensagem: 'Aluno já cadastrado',
        detalhes: 'Este usuário já possui um registro como aluno'
      });
    }

    // Verifica se o RA já está em uso
    const raExistente = await client.query(
      'SELECT * FROM "Alunos" WHERE ra = $1',
      [ra]
    );

    if (raExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        mensagem: 'RA já cadastrado',
        detalhes: 'Este RA já está sendo utilizado por outro aluno'
      });
    }

    // Insere o novo aluno com data_matricula e foto_url fornecidos
    const result = await client.query(
      `INSERT INTO "Alunos" 
       (fk_id_usuario, ra, curso_semestre, deseja_ser_candidato, foto_url, data_matricula) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        fk_id_usuario,
        ra,
        curso_semestre,
        deseja_ser_candidato || false,
        foto_url || null,
        data_matricula
      ]
    );

    // Atualiza status do usuário para Ativo
    await client.query(
      `UPDATE "Usuarios" SET status_usuario = 'Ativo' WHERE id = $1`,
      [fk_id_usuario]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      mensagem: 'Aluno cadastrado com sucesso!',
      aluno: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao cadastrar aluno:', error);
    return res.status(500).json({
      mensagem: 'Erro ao cadastrar aluno',
      detalhes: error.message
    });
  } finally {
    client.release();
  }
}
