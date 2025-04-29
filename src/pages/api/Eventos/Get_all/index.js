import { conectar_banco } from '../../../../config/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const client = await conectar_banco();
  
  try {
    // Buscar todos os eventos
    const result = await client.query(
      `SELECT * FROM "Eventos" ORDER BY data_inicio DESC`
    );

    const eventos = result.rows;

    // Para cada evento, buscar projetos e representantes
    const eventosCompleto = await Promise.all(
      eventos.map(async (evento) => {
        const [projetos, representantes] = await Promise.all([
          // Buscar projetos do evento
          client.query(
            `SELECT p.* FROM "Projetos" p
             INNER JOIN "ProjetosEventos" pe ON p.id_projeto = pe.fk_id_projeto
             WHERE pe.fk_id_evento = $1`,
            [evento.id_evento]
          ),
          // Buscar representantes do evento
          client.query(
            `SELECT r.*, a.*, u.nome, u.email_institucional 
             FROM "Representantes" r
             INNER JOIN "Alunos" a ON r.fk_id_aluno = a.id_aluno
             INNER JOIN "Usuarios" u ON a.fk_id_usuario = u.id
             WHERE r.fk_id_evento = $1`,
            [evento.id_evento]
          )
        ]);

        return {
          ...evento,
          projetos: projetos.rows,
          representantes: representantes.rows
        };
      })
    );

    res.status(200).json({
      mensagem: 'Eventos listados com sucesso',
      eventos: eventosCompleto
    });

  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ 
      mensagem: 'Erro ao listar eventos',
      detalhes: error.message 
    });
  } finally {
    client.release();
  }
} 