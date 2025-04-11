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

    const { id_candidato } = req.query;
    console.log('ID do candidato recebido:', id_candidato);

    if (!id_candidato) {
      return res.status(400).json({ erro: 'ID do candidato é obrigatório' });
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Buscar dados do candidato
    const candidato = await new Promise((resolve, reject) => {
      db.get(`
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
        WHERE c.id_candidato = ?
      `, [id_candidato], (err, row) => {
        if (err) {
          console.error('Erro ao buscar candidato:', err);
          reject(err);
        }
        resolve(row);
      });
    });

    console.log('Dados do candidato:', candidato);

    if (!candidato) {
      return res.status(404).json({ erro: 'Candidato não encontrado' });
    }

    return res.status(200).json(candidato);

  } catch (error) {
    console.error('Erro ao buscar candidato:', error);
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