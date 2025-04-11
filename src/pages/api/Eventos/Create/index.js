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
    const camposObrigatorios = ['nome_evento', 'tipo_evento'];
    for (const campo of camposObrigatorios) {
      if (!fields[campo]) {
        return res.status(400).json({ erro: `Campo ${campo} é obrigatório` });
      }
    }

    // Validar tipo_evento
    if (!['interno', 'externo'].includes(fields.tipo_evento)) {
      return res.status(400).json({ erro: 'Tipo de evento inválido. Deve ser "interno" ou "externo"' });
    }

    db = await conectar_banco();

    // Inserir evento no banco
    const stmt = await db.prepare(`
      INSERT INTO Eventos (
        nome_evento, tipo_evento
      ) VALUES (?, ?)
    `);

    const result = await stmt.run(
      fields.nome_evento,
      fields.tipo_evento
    );

    await stmt.finalize();

    // Obter o ID do evento inserido
    const id_evento = await new Promise((resolve, reject) => {
      db.get('SELECT last_insert_rowid() as id', (err, row) => {
        if (err) reject(err);
        resolve(row.id);
      });
    });

    await db.close();

    return res.status(201).json({
      mensagem: 'Evento criado com sucesso',
      evento: {
        id_evento,
        nome_evento: fields.nome_evento,
        tipo_evento: fields.tipo_evento
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