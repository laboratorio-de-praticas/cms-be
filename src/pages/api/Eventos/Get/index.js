import conectar_banco from '@/config/database';
import authMiddleware from '@/middleware/authMiddleware';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { id_evento } = req.query;

  if (!id_evento) {
    return res.status(400).json({ erro: 'ID do evento é obrigatório' });
  }

  let db;
  try {
    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Buscar evento específico
    const evento = await db.get(`
      SELECT 
        e.*,
        COUNT(DISTINCT ep.id_projeto) as total_projetos,
        COUNT(DISTINCT ec.id_candidato) as total_candidatos
      FROM Eventos e
      LEFT JOIN EventoProjeto ep ON e.id_evento = ep.id_evento
      LEFT JOIN EventoCandidato ec ON e.id_evento = ec.id_evento
      WHERE e.id_evento = ? AND e.ativo = 1
      GROUP BY e.id_evento
    `, [id_evento]);

    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado' });
    }

    // Buscar projetos do evento
    const projetos = await db.all(`
      SELECT p.* 
      FROM Projetos p
      JOIN EventoProjeto ep ON p.id_projeto = ep.id_projeto
      WHERE ep.id_evento = ? AND p.ativo = 1
    `, [id_evento]);

    // Buscar candidatos do evento
    const candidatos = await db.all(`
      SELECT c.* 
      FROM Candidatos c
      JOIN EventoCandidato ec ON c.id_candidato = ec.id_candidato
      WHERE ec.id_evento = ? AND c.ativo = 1
    `, [id_evento]);

    return res.status(200).json({
      ...evento,
      projetos,
      candidatos
    });

  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: error.message 
    });
  } finally {
    if (db) {
      await db.close();
      console.log('Conexão com o banco fechada');
    }
  }
}

export default authMiddleware(handler); 