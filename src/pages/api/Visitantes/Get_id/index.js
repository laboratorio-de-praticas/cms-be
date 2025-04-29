import { conectar_banco } from '@/config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { id_visitante } = req.query;

  if (!id_visitante) {
    return res.status(400).json({ erro: 'ID do visitante é obrigatório' });
  }

  const client = await conectar_banco();
  
  try {
    const result = await client.query(
      `SELECT id_visitante, nome, telefone, chave_acesso, data_criacao, data_alteracao 
       FROM "Visitantes" 
       WHERE id_visitante = $1`,
      [id_visitante]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Visitante não encontrado' });
    }

    return res.status(200).json({
      mensagem: 'Visitante encontrado com sucesso',
      dados: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar visitante:', error);
    return res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
} 