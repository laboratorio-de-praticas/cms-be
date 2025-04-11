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

    // Buscar todos os eventos usando uma Promise
    const eventos = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          e.id_evento,
          e.nome_evento,
          e.tipo_evento
        FROM Eventos e
        ORDER BY e.id_evento DESC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });

    // Se não houver eventos, retornar array vazio
    if (!eventos || eventos.length === 0) {
      return res.status(200).json({
        eventos: [],
        total: 0
      });
    }

    // Para cada evento, buscar a contagem de projetos e candidatos
    for (let evento of eventos) {
      const [projetos, candidatos] = await Promise.all([
        new Promise((resolve, reject) => {
          db.get(`
            SELECT COUNT(*) as total 
            FROM EventoxProjeto 
            WHERE id_evento = ?
          `, [evento.id_evento], (err, row) => {
            if (err) reject(err);
            else resolve(row || { total: 0 });
          });
        }),
        new Promise((resolve, reject) => {
          db.get(`
            SELECT COUNT(*) as total 
            FROM EventoxCandidato 
            WHERE id_evento = ?
          `, [evento.id_evento], (err, row) => {
            if (err) reject(err);
            else resolve(row || { total: 0 });
          });
        })
      ]);

      evento.total_projetos = projetos.total;
      evento.total_candidatos = candidatos.total;
    }

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