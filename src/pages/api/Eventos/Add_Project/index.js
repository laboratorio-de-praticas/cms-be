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

    const { id_evento, id_projeto } = req.body;
    console.log('Dados recebidos:', { id_evento, id_projeto });

    if (!id_evento || !id_projeto) {
      return res.status(400).json({ erro: 'ID do evento e ID do projeto são obrigatórios' });
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

      // Verificar se o projeto existe e está ativo
      const projeto = await db.get(`
        SELECT id_projeto FROM Projetos 
        WHERE id_projeto = ? AND ativo = 1
      `, [id_projeto]);

      if (!projeto) {
        await db.run('ROLLBACK');
        return res.status(404).json({ erro: 'Projeto não encontrado ou inativo' });
      }

      // Verificar se o projeto já está inscrito no evento
      const inscricaoExistente = await db.get(`
        SELECT COUNT(*) as total FROM EventoxProjeto 
        WHERE id_evento = ? AND id_projeto = ?
      `, [id_evento, id_projeto]);

      console.log('Verificação de inscrição existente:', {
        id_evento,
        id_projeto,
        inscricaoExistente
      });

      if (inscricaoExistente && inscricaoExistente.total > 0) {
        await db.run('ROLLBACK');
        return res.status(400).json({ 
          erro: 'Projeto já está inscrito neste evento',
          detalhes: {
            id_evento,
            id_projeto
          }
        });
      }

      // Gerar URL de votação no formato correto
      const url_votacao = `/votacao/publica/confirmacao/${id_projeto}/${id_evento}`;

      // Inserir projeto no evento
      const stmt = await db.prepare(`
        INSERT INTO EventoxProjeto (
          id_evento,
          id_projeto,
          url_votacao
        ) VALUES (?, ?, ?)
      `);

      await stmt.run(id_evento, id_projeto, url_votacao);
      await stmt.finalize();

      // Commit da transação
      await db.run('COMMIT');

      return res.status(201).json({
        mensagem: 'Projeto adicionado ao evento com sucesso',
        dados: {
          id_evento,
          id_projeto,
          url_votacao
        }
      });

    } catch (error) {
      // Rollback em caso de erro
      await db.run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erro ao adicionar projeto ao evento:', error);
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