import { conectar_banco } from '../../../../config/database';
import ENUMS from '../../../../config/enums';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { id_evento } = req.query;
  const {
    tipo_evento,
    nome_evento,
    descricao_evento,
    status_evento,
    curso_semestre,
    ano_semestre,
    data_inicio,
    data_fim
  } = req.body;

  if (!id_evento) {
    return res.status(400).json({ mensagem: 'ID do evento não fornecido' });
  }

  if (!tipo_evento && !nome_evento && !descricao_evento && !status_evento && 
      !curso_semestre && !ano_semestre && !data_inicio && !data_fim) {
    return res.status(400).json({ mensagem: 'Nenhum campo para atualizar fornecido' });
  }

  if (tipo_evento && !Object.values(ENUMS.EventoTipos).includes(tipo_evento)) {
    return res.status(400).json({ mensagem: 'Tipo de evento inválido' });
  }

  if (status_evento && !Object.values(ENUMS.EventoStatus).includes(status_evento)) {
    return res.status(400).json({ mensagem: 'Status de evento inválido' });
  }

  const client = await conectar_banco();
  
  try {
    // Iniciar transação
    await client.query('BEGIN');

    // Verificar se o evento existe
    const evento = await client.query(
      'SELECT * FROM "Eventos" WHERE id_evento = $1',
      [id_evento]
    );

    if (evento.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensagem: 'Evento não encontrado' });
    }

    // Atualizar evento
    const campos = [];
    const valores = [];
    let indice = 1;

    if (tipo_evento) {
      campos.push(`tipo_evento = $${indice}`);
      valores.push(tipo_evento);
      indice++;
    }
    if (nome_evento) {
      campos.push(`nome_evento = $${indice}`);
      valores.push(nome_evento);
      indice++;
    }
    if (descricao_evento) {
      campos.push(`descricao_evento = $${indice}`);
      valores.push(descricao_evento);
      indice++;
    }
    if (status_evento) {
      campos.push(`status_evento = $${indice}`);
      valores.push(status_evento);
      indice++;
    }
    if (curso_semestre !== undefined) {
      campos.push(`curso_semestre = $${indice}`);
      valores.push(curso_semestre);
      indice++;
    }
    if (ano_semestre !== undefined) {
      campos.push(`ano_semestre = $${indice}`);
      valores.push(ano_semestre);
      indice++;
    }
    if (data_inicio) {
      campos.push(`data_inicio = $${indice}`);
      valores.push(data_inicio);
      indice++;
    }
    if (data_fim) {
      campos.push(`data_fim = $${indice}`);
      valores.push(data_fim);
      indice++;
    }

    valores.push(id_evento);

    await client.query(
      `UPDATE "Eventos" SET ${campos.join(', ')}, data_alteracao = NOW() WHERE id_evento = $${indice}`,
      valores
    );

    // Commit da transação
    await client.query('COMMIT');

    res.status(200).json({
      mensagem: 'Evento atualizado com sucesso',
      id_evento
    });

  } catch (error) {
    // Rollback em caso de erro
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ 
      mensagem: 'Erro ao atualizar evento',
      detalhes: error.message 
    });
  } finally {
    client.release();
  }
} 