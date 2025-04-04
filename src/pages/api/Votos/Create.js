import { requireAuth, canVote } from '../../../middleware/authMiddleware';
import { pool } from '../../../config/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Aplicar middlewares
    await requireAuth(req, res, async () => {
      await canVote(req, res, async () => {
        const { id_candidato, id_evento } = req.body;
        const id_participante = req.userId;

        // Verificar se o usuário já votou neste candidato neste evento
        const existingVote = await pool.query(
          'SELECT * FROM Votos WHERE id_candidato = $1 AND id_participante = $2 AND id_evento = $3',
          [id_candidato, id_participante, id_evento]
        );

        if (existingVote.rows.length > 0) {
          return res.status(400).json({ error: 'Você já votou neste candidato neste evento' });
        }

        // Inserir o voto
        const result = await pool.query(
          'INSERT INTO Votos (id_candidato, id_participante, id_evento) VALUES ($1, $2, $3) RETURNING *',
          [id_candidato, id_participante, id_evento]
        );

        res.status(201).json(result.rows[0]);
      });
    });
  } catch (error) {
    console.error('Erro ao criar voto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 