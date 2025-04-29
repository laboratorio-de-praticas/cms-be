import { conectar_banco } from '@/config/database';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  // O ID agora será enviado no corpo da requisição, então retiramos a query
  const { id_aluno, ra, curso_semestre, deseja_ser_candidato, foto_url } = req.body;

  if (!id_aluno) {
    return res.status(400).json({ mensagem: 'ID do aluno não fornecido' });
  }

  // Valida se o ID é um número válido
  if (isNaN(Number(id_aluno))) {
    return res.status(400).json({ mensagem: 'ID do aluno inválido' });
  }

  const client = await conectar_banco();

  try {
    // Validações básicas
    if (!ra || !curso_semestre) {
      return res.status(400).json({ 
        mensagem: 'RA e curso_semestre são obrigatórios',
        campos_necessarios: ['ra', 'curso_semestre']
      });
    }

    // Verifica se o RA é um número válido (int4)
    if (isNaN(Number(ra)) || Number(ra) <= 0) {
      return res.status(400).json({ mensagem: 'RA inválido, deve ser um número inteiro positivo' });
    }

    // Verifica se o curso_semestre é um texto válido (não pode ser vazio)
    if (typeof curso_semestre !== 'string' || curso_semestre.trim() === '') {
      return res.status(400).json({ mensagem: 'O campo curso_semestre deve ser um texto não vazio' });
    }

    // Verifica se o campo deseja_ser_candidato é booleano, caso contrário, define como false
    const desejaSerCandidato = typeof deseja_ser_candidato === 'boolean' ? deseja_ser_candidato : false;

    // Verifica se o aluno existe
    const alunoExistente = await client.query(
      'SELECT * FROM "Alunos" WHERE id_aluno = $1',
      [id_aluno]
    );

    if (alunoExistente.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    }

    // Verifica se o RA já está em uso por outro aluno
    const raExistente = await client.query(
      'SELECT id_aluno FROM "Alunos" WHERE ra = $1 AND id_aluno != $2',
      [ra, id_aluno]
    );

    if (raExistente.rows.length > 0) {
      return res.status(400).json({ mensagem: 'RA já está em uso por outro aluno' });
    }

    // Atualiza o aluno
    const query = `
      UPDATE "Alunos"
      SET 
        ra = $1,
        curso_semestre = $2,
        deseja_ser_candidato = $3,
        foto_url = $4
      WHERE id_aluno = $5
      RETURNING *
    `;

    const result = await client.query(query, [
      ra,
      curso_semestre,
      deseja_ser_candidato,
      foto_url || null,
      id_aluno
    ]);

    return res.status(200).json({
      mensagem: 'Aluno atualizado com sucesso',
      aluno: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    return res.status(500).json({
      mensagem: 'Erro ao atualizar aluno',
      detalhes: error.message
    });
  } finally {
    client.release();
  }
}
