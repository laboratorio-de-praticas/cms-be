import { conectar_banco } from '../../../../config/database';
import ENUMS from '../../../../config/enums';
// import authMiddleware from '../../../../middleware/authMiddleware';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  try {
    const {
      tipo_evento,
      nome_evento,
      descricao_evento,
      curso_semestre,
      ano_semestre,
      data_inicio,
      data_fim
    } = req.body;

    if (!tipo_evento || !nome_evento || !descricao_evento || !data_inicio || !data_fim) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios não fornecidos' });
    }

    if (!Object.values(ENUMS.EventoTipos).includes(tipo_evento)) {
      return res.status(400).json({ mensagem: 'Tipo de evento inválido' });
    }

    const client = await conectar_banco();
    
    try {
      // Verificar autenticação
      // const auth = await authMiddleware(req, res);
      // if (!auth.success) {
      //   return res.status(401).json({ erro: auth.mensagem });
      // }

      // Validar datas
      const dataInicio = new Date(data_inicio);
      const dataFim = new Date(data_fim);
      
      if (dataInicio >= dataFim) {
        return res.status(400).json({ mensagem: 'Data de início deve ser anterior à data de fim' });
      }

      // Iniciar transação
      await client.query('BEGIN');

      // Resetar a sequência se necessário
      await client.query(`
        SELECT setval(
          pg_get_serial_sequence('"Eventos"', 'id_evento'),
          COALESCE((SELECT MAX(id_evento) FROM "Eventos"), 0) + 1,
          false
        )
      `);

      // Inserir evento
      const result = await client.query(
        `INSERT INTO "Eventos" 
         (tipo_evento, nome_evento, descricao_evento, curso_semestre, 
          ano_semestre, data_inicio, data_fim, status_evento) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id_evento`,
        [
          tipo_evento,
          nome_evento,
          descricao_evento,
          curso_semestre || null,
          ano_semestre || null,
          data_inicio,
          data_fim,
          ENUMS.EventoStatus.EM_PREPARO
        ]
      );

      const id_evento = result.rows[0].id_evento;

      // Commit da transação
      await client.query('COMMIT');

      res.status(201).json({
        mensagem: 'Evento criado com sucesso',
        id_evento
      });

    } catch (error) {
      // Rollback em caso de erro
      await client.query('ROLLBACK');
      console.error('Erro ao criar evento:', error);
      res.status(500).json({ 
        mensagem: 'Erro ao criar evento',
        detalhes: error.message 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    res.status(400).json({ mensagem: 'Erro ao processar os dados da requisição' });
  }
} 