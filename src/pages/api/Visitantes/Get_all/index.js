import { conectar_banco } from '@/config/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const client = await conectar_banco();
  
  try {
    const result = await client.query(
      `SELECT id_visitante, nome, telefone, chave_acesso, data_criacao, data_alteracao 
       FROM "Visitantes" 
       ORDER BY data_criacao DESC`
    );

    return res.status(200).json({
      mensagem: 'Visitantes recuperados com sucesso',
      total: result.rows.length,
      dados: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar visitantes:', error);
    return res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await client.end();
  }
} 