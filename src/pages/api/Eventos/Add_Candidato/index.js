import conectar_banco from '@/config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  let db;
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ mensagem: auth.mensagem });
    // }

    const { id_evento, id_candidato } = req.body;
    console.log('Dados recebidos:', { id_evento, id_candidato });

    if (!id_evento || !id_candidato) {
      return res.status(400).json({ erro: 'ID do evento e ID do candidato são obrigatórios' });
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Iniciar transação
    await db.run('BEGIN TRANSACTION');

    try {
      // Verificar se o evento existe
      const evento = await db.get(`
        SELECT id_evento FROM Eventos 
        WHERE id_evento = ?
      `, [id_evento]);

      if (!evento) {
        await db.run('ROLLBACK');
        return res.status(404).json({ erro: 'Evento não encontrado' });
      }

      // Verificar se o candidato existe
      const candidato = await db.get(`
        SELECT id_candidato FROM Candidato 
        WHERE id_candidato = ?
      `, [id_candidato]);

      if (!candidato) {
        await db.run('ROLLBACK');
        return res.status(404).json({ erro: 'Candidato não encontrado' });
      }

      // Verificar se o candidato já está inscrito no evento
      const inscricaoExistente = await db.get(`
        SELECT COUNT(*) as total FROM EventoxCandidato 
        WHERE id_evento = ? AND id_candidato = ?
      `, [id_evento, id_candidato]);

      console.log('Verificação de inscrição existente:', {
        id_evento,
        id_candidato,
        inscricaoExistente
      });

      if (inscricaoExistente && inscricaoExistente.total > 0) {
        await db.run('ROLLBACK');
        return res.status(400).json({ 
          erro: 'Candidato já está inscrito neste evento',
          detalhes: {
            id_evento,
            id_candidato
          }
        });
      }

      // Gerar URL de votação no formato correto
      const url_votacao = `/votacao/interna/confirmacao/${id_candidato}/${id_evento}`;

      // Inserir candidato no evento
      const stmt = await db.prepare(`
        INSERT INTO EventoxCandidato (
          id_evento,
          id_candidato,
          url_votacao
        ) VALUES (?, ?, ?)
      `);

      await stmt.run(id_evento, id_candidato, url_votacao);
      await stmt.finalize();

      // Commit da transação
      await db.run('COMMIT');

      return res.status(201).json({
        mensagem: 'Candidato adicionado ao evento com sucesso',
        dados: {
          id_evento,
          id_candidato,
          url_votacao
        }
      });

    } catch (error) {
      // Rollback em caso de erro
      await db.run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erro ao adicionar candidato ao evento:', error);
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