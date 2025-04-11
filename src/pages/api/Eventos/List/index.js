import conectar_banco from '@/config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  let db;
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ mensagem: auth.mensagem });
    // }

    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Buscar todos os eventos ativos
    const eventos = await db.all(`
      SELECT 
        e.*,
        COUNT(DISTINCT ep.id_projeto) as total_projetos,
        COUNT(DISTINCT ec.id_candidato) as total_candidatos
      FROM Eventos e
      LEFT JOIN EventoProjeto ep ON e.id_evento = ep.id_evento
      LEFT JOIN EventoCandidato ec ON e.id_evento = ec.id_evento
      WHERE e.ativo = 1
      GROUP BY e.id_evento
      ORDER BY e.data_inicio DESC
    `);

    return res.status(200).json({
      eventos,
      total: eventos.length
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