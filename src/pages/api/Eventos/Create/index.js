import { IncomingForm } from 'formidable';
import conectar_banco from '@/config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ erro: auth.mensagem });
    // }

    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Validação dos campos obrigatórios
    const camposObrigatorios = ['nome_evento', 'descricao', 'data_inicio', 'data_fim', 'local'];
    for (const campo of camposObrigatorios) {
      if (!fields[campo]) {
        return res.status(400).json({ erro: `Campo ${campo} é obrigatório` });
      }
    }

    // Validar datas
    const dataInicio = new Date(fields.data_inicio);
    const dataFim = new Date(fields.data_fim);
    if (dataInicio >= dataFim) {
      return res.status(400).json({ erro: 'Data de início deve ser anterior à data de fim' });
    }

    db = await conectar_banco();

    // Inserir evento no banco
    const id = crypto.randomUUID();
    await db.run(`
      INSERT INTO Eventos (
        id, nome_evento, descricao, data_inicio, data_fim, local, ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      fields.nome_evento,
      fields.descricao,
      fields.data_inicio,
      fields.data_fim,
      fields.local,
      true
    ]);

    await db.close();

    return res.status(201).json({
      mensagem: 'Evento criado com sucesso',
      evento: {
        id_evento: id,
        nome_evento: fields.nome_evento,
        descricao: fields.descricao,
        data_inicio: fields.data_inicio,
        data_fim: fields.data_fim,
        local: fields.local,
        ativo: true
      }
    });

  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: error.message 
    });
  }
} 