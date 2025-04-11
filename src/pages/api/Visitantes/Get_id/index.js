import conectar_banco from '@/config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  let db;
  try {
    const { id_visitante } = req.query;
    console.log('ID do visitante recebido:', id_visitante);

    if (!id_visitante) {
      return res.status(400).json({ erro: 'ID do visitante não encontrado' });
    }

    db = await conectar_banco();
    console.log('Banco de dados conectado');

    const visitante = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM Visitantes WHERE id_visitante = ?
      `, [id_visitante], (err, row) => {
        if (err) {
          console.error('Erro ao buscar visitante:', err);
          reject(err);
        }
        resolve(row);
      });
    });

    console.log('Dados do visitante:', visitante);

    if (!visitante) {
      return res.status(404).json({ erro: 'Visitante não encontrado' });
    }

    return res.status(200).json(visitante);
  } catch (error) {
    console.error('Erro ao buscar visitante:', error);
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