import { conectar_banco } from '../../../../config/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ mensagem: 'ID do aluno não fornecido' });
  }

  // Valida se o ID é um número válido
  if (isNaN(Number(id))) {
    return res.status(400).json({ mensagem: 'ID do aluno inválido' });
  }

  const client = await conectar_banco();

  try {
    // Corrige a consulta SQL
    const query = `
      SELECT 
        "id_aluno", 
        "ra", 
        "curso_semestre", 
        "deseja_ser_candidato", 
        "foto_url", 
        "data_matricula"
      FROM "Alunos"
      WHERE "id_aluno" = $1
    `;

    // Executa a consulta no banco
    const result = await client.query(query, [id]);

    // Verifica se o aluno foi encontrado
    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    }

    // Retorna os dados do aluno
    return res.status(200).json({
      mensagem: 'Aluno encontrado com sucesso',
      dados: result.rows[0]
    });
  } catch (error) {
    // Erro ao buscar aluno
    console.error('Erro ao buscar aluno:', error);
    return res.status(500).json({
      mensagem: 'Erro ao buscar aluno',
      detalhes: error.message
    });
  } finally {
    client.release();
  }
}
