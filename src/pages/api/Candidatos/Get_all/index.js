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

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    const candidatos = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          c.id_candidato,
          c.ra,
          c.turma_atual,
          c.deseja_ser_candidato,
          c.descricao_campanha,
          u.id_usuario,
          u.nome,
          u.email_institucional,
          u.telefone,
          u.foto,
          u.tipo_usuario
        FROM Candidato c
        JOIN Usuario u ON c.id_usuario = u.id_usuario
        WHERE u.ativo = 1
        ORDER BY u.nome ASC
      `, (err, rows) => {
        if (err) {
          console.error('Erro ao buscar candidatos:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });

    console.log('Candidatos encontrados:', candidatos);

    return res.status(200).json(candidatos);

  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
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