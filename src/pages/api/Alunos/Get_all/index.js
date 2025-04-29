import { conectar_banco } from '@/config/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const client = await conectar_banco();

  try {
    const query = `
      SELECT 
        "id_aluno",
        "ra",
        "curso_semestre",
        "deseja_ser_candidato",
        "foto_url",
        "data_matricula"
      FROM "Alunos"
      ORDER BY "ra" ASC
    `;

    const result = await client.query(query);
    const alunos = result.rows;

    return res.status(200).json({
      mensagem: 'Alunos listados com sucesso',
      total: alunos.length,
      dados: alunos
    });
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    return res.status(500).json({
      mensagem: 'Erro ao listar alunos',
      detalhes: error.message
    });
  } finally {
    client.release();
  }
}
