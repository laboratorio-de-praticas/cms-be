import { conectar_banco } from '../../../../config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { fk_id_evento, fk_id_projeto } = req.body;

  if (!fk_id_evento || !fk_id_projeto) {
    return res.status(400).json({ 
      mensagem: 'ID do evento e ID do projeto são obrigatórios',
      dados_recebidos: req.body
    });
  }

  const client = await conectar_banco();
  
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ mensagem: auth.mensagem });
    // }

    // Iniciar transação
    await client.query('BEGIN');

    // Verificar se o evento existe
    const evento = await client.query(
      'SELECT * FROM "Eventos" WHERE id_evento = $1',
      [fk_id_evento]
    );

    if (evento.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensagem: 'Evento não encontrado' });
    }

    // Verificar se o projeto existe
    const projeto = await client.query(
      'SELECT * FROM "Projetos" WHERE id_projeto = $1',
      [fk_id_projeto]
    );

    if (projeto.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensagem: 'Projeto não encontrado' });
    }

    // Verificar se o projeto já está no evento
    const projetoEvento = await client.query(
      'SELECT * FROM "ProjetosEventos" WHERE fk_id_evento = $1 AND fk_id_projeto = $2',
      [fk_id_evento, fk_id_projeto]
    );

    if (projetoEvento.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ mensagem: 'Projeto já está cadastrado neste evento' });
    }

    // Gerar URL do QR Code
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrcode = `${baseUrl}/votacao/publica/confirmacao/id_projeto=${fk_id_projeto}/id_evento=${fk_id_evento}`;

    // Inserir projeto no evento
    await client.query(
      'INSERT INTO "ProjetosEventos" (fk_id_evento, fk_id_projeto, qrcode) VALUES ($1, $2, $3)',
      [fk_id_evento, fk_id_projeto, qrcode]
    );

    // Commit da transação
    await client.query('COMMIT');

    res.status(201).json({
      mensagem: 'Projeto adicionado ao evento com sucesso',
      fk_id_evento,
      fk_id_projeto,
      qrcode
    });

  } catch (error) {
    // Rollback em caso de erro
    await client.query('ROLLBACK');
    console.error('Erro ao adicionar projeto ao evento:', error);
    res.status(500).json({ 
      mensagem: 'Erro ao adicionar projeto ao evento',
      detalhes: error.message 
    });
  } finally {
    client.release();
  }
} 