import { conectar_banco } from '../../../../config/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { fk_id_evento, fk_id_aluno, descricao_campanha } = req.body;

  if (!fk_id_evento || !fk_id_aluno) {
    return res.status(400).json({ 
      mensagem: 'ID do evento e ID do aluno são obrigatórios',
      dados_recebidos: req.body
    });
  }

  const client = await conectar_banco();
  
  try {
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

    // Verificar se o aluno existe
    const aluno = await client.query(
      'SELECT * FROM "Alunos" WHERE id_aluno = $1',
      [fk_id_aluno]
    );

    if (aluno.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    }

    // Verificar se o aluno já é representante em algum evento com status diferente de Desligado
    const representanteAtivo = await client.query(
      'SELECT * FROM "Representantes" WHERE fk_id_aluno = $1 AND RepresentanteSituacao != $2',
      [fk_id_aluno, 'Desligado']
    );

    if (representanteAtivo.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        mensagem: 'Aluno já é representante em outro evento e precisa ser desligado primeiro',
        evento_atual: representanteAtivo.rows[0].fk_id_evento,
        status_atual: representanteAtivo.rows[0].RepresentanteSituacao
      });
    }

    // Verificar se o aluno já é representante no evento específico
    const representanteEvento = await client.query(
      'SELECT * FROM "Representantes" WHERE fk_id_evento = $1 AND fk_id_aluno = $2',
      [fk_id_evento, fk_id_aluno]
    );

    if (representanteEvento.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ mensagem: 'Aluno já é representante neste evento' });
    }

    // Gerar URL do QR Code
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrcode = `${baseUrl}/votacao/publica/confirmacao/id_aluno=${fk_id_aluno}/id_evento=${fk_id_evento}`;

    // Inserir representante no evento
    await client.query(
      'INSERT INTO "Representantes" (fk_id_evento, fk_id_aluno, descricao_campanha, qrcode, RepresentanteSituacao) VALUES ($1, $2, $3, $4, $5) RETURNING id_representante',
      [fk_id_evento, fk_id_aluno, descricao_campanha || null, qrcode, 'Pendente']
    );

    // Commit da transação
    await client.query('COMMIT');

    res.status(201).json({
      mensagem: 'Representante adicionado ao evento com sucesso',
      fk_id_evento,
      fk_id_aluno,
      qrcode
    });

  } catch (error) {
    // Rollback em caso de erro
    await client.query('ROLLBACK');
    console.error('Erro ao adicionar representante ao evento:', error);
    res.status(500).json({ 
      mensagem: 'Erro ao adicionar representante ao evento',
      detalhes: error.message 
    });
  } finally {
    client.release();
  }
} 