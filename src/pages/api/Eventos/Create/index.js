import conectar_banco from '@/config/database';
import authMiddleware from '@/middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    const { nome_evento, descricao, data_inicio, data_fim, local } = req.body;

    // Validação dos campos obrigatórios
    if (!nome_evento || !descricao || !data_inicio || !data_fim || !local) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios faltando',
        campos_faltando: {
          nome_evento: !nome_evento,
          descricao: !descricao,
          data_inicio: !data_inicio,
          data_fim: !data_fim,
          local: !local
        }
      });
    }

    // Validação das datas
    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    
    if (inicio >= fim) {
      return res.status(400).json({ 
        erro: 'Data de início deve ser anterior à data de fim' 
      });
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Inserir evento no banco
    const stmt = await db.prepare(`
      INSERT INTO Eventos (
        nome_evento, descricao, data_inicio, data_fim, local
      ) VALUES (?, ?, ?, ?, ?)
    `);

    try {
      const result = await stmt.run(
        nome_evento,
        descricao,
        data_inicio,
        data_fim,
        local
      );

      await stmt.finalize();
      console.log('Evento inserido com sucesso:', result);

      const id_evento = result.lastID;
      console.log('ID do evento:', id_evento);

      // Buscar o evento inserido para confirmar
      const eventoInserido = await db.get(
        'SELECT * FROM Eventos WHERE id_evento = ?',
        [id_evento]
      );

      if (!eventoInserido) {
        throw new Error('Evento não foi encontrado após inserção');
      }

      console.log('Evento confirmado no banco:', eventoInserido);

      return res.status(201).json({
        mensagem: 'Evento criado com sucesso',
        evento: {
          id_evento,
          nome_evento,
          descricao,
          data_inicio,
          data_fim,
          local
        }
      });

    } catch (error) {
      console.error('Erro ao inserir evento:', error);
      throw error;
    }

  } catch (error) {
    console.error('Erro ao criar evento:', error);
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