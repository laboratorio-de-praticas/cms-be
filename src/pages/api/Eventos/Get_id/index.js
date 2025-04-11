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

    const { id_evento } = req.query;
    console.log('ID do evento recebido:', id_evento);

    if (!id_evento) {
      return res.status(400).json({ erro: 'ID do evento é obrigatório' });
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Buscar dados do evento
    const evento = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          e.id_evento,
          e.nome_evento,
          e.tipo_evento
        FROM Eventos e
        WHERE e.id_evento = ?
      `, [id_evento], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    console.log('Dados do evento:', evento);

    if (!evento) {
      return res.status(404).json({ erro: 'Evento não encontrado' });
    }

    // Buscar projetos do evento
    const projetos = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          p.id_projeto,
          p.nome_projeto,
          p.nome_equipe
        FROM EventoxProjeto ep
        JOIN Projetos p ON ep.id_projeto = p.id_projeto
        WHERE ep.id_evento = ?
      `, [id_evento], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    console.log('Projetos encontrados:', projetos);

    // Buscar candidatos do evento
    const candidatos = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          c.id_candidato,
          u.nome,
          c.ra
        FROM EventoxCandidato ec
        JOIN Candidato c ON ec.id_candidato = c.id_candidato
        JOIN Usuario u ON c.id_usuario = u.id_usuario
        WHERE ec.id_evento = ?
      `, [id_evento], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    console.log('Candidatos encontrados:', candidatos);

    const resposta = {
      evento: {
        ...evento,
        projetos: projetos || [],
        candidatos: candidatos || []
      }
    };

    console.log('Resposta final:', resposta);

    return res.status(200).json(resposta);

  } catch (error) {
    console.error('Erro ao buscar evento:', error);
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