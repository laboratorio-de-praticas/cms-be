import { requireAuth, canEditProfile } from '../../../middleware/authMiddleware';
import { pool } from '../../../config/database';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Aplicar middlewares
    await requireAuth(req, res, async () => {
      await canEditProfile(req, res, async () => {
        const { id } = req.params;
        const { nome, email_institucional } = req.body;

        // Atualizar o perfil
        const result = await pool.query(
          `UPDATE Usuarios 
           SET nome = $1, 
               email_institucional = $2, 
               data_alteracao = CURRENT_TIMESTAMP 
           WHERE id = $3 
           RETURNING *`,
          [nome, email_institucional, id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.status(200).json(result.rows[0]);
      });
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 