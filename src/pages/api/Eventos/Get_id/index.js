import { conectar_banco } from '../../../../config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { id_evento } = req.query;

  if (!id_evento) {
    return res.status(400).json({ mensagem: 'ID do evento não fornecido' });
  }

  const client = await conectar_banco();
  
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ mensagem: auth.mensagem });
    // }

    // Buscar dados do evento
    const eventoResult = await client.query(
      `SELECT * FROM "Eventos" WHERE id_evento = $1`,
      [id_evento]
    );

    if (eventoResult.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Evento não encontrado' });
    }

    const evento = eventoResult.rows[0];

    // Buscar projetos do evento
    const projetosResult = await client.query(
      `SELECT p.* FROM "Projetos" p
       INNER JOIN "ProjetosEventos" pe ON p.id_projeto = pe.fk_id_projeto
       WHERE pe.fk_id_evento = $1`,
      [id_evento]
    );

    // Buscar representantes do evento
    const representantesResult = await client.query(
      `SELECT r.*, a.*, u.nome, u.email_institucional 
       FROM "Representantes" r
       INNER JOIN "Alunos" a ON r.fk_id_aluno = a.id_aluno
       INNER JOIN "Usuarios" u ON a.fk_id_usuario = u.id
       WHERE r.fk_id_evento = $1`,
      [id_evento]
    );

    res.status(200).json({
      mensagem: 'Evento encontrado com sucesso',
      evento: {
        ...evento,
        projetos: projetosResult.rows,
        representantes: representantesResult.rows
      }
    });

  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ 
      mensagem: 'Erro ao buscar evento',
      detalhes: error.message 
    });
  } finally {
    client.release();
  }
} 