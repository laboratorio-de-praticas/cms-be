import { conectar_banco } from '@/config/database';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { id_visitante } = req.query;
  const { nome, telefone } = req.body;

  if (!id_visitante) {
    return res.status(400).json({ erro: 'ID do visitante é obrigatório' });
  }

  if (!nome && !telefone) {
    return res.status(400).json({ erro: 'Nenhum campo para atualizar fornecido' });
  }

  const client = await conectar_banco();
  
  try {
    // Iniciar transação
    await client.query('BEGIN');

    // Verificar se o visitante existe
    const visitante = await client.query(
      'SELECT * FROM "Visitantes" WHERE id_visitante = $1',
      [id_visitante]
    );

    if (visitante.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: 'Visitante não encontrado' });
    }

    // Verificar se o novo telefone já está em uso
    if (telefone && telefone !== visitante.rows[0].telefone) {
      const telefoneExistente = await client.query(
        'SELECT * FROM "Visitantes" WHERE telefone = $1 AND id_visitante != $2',
        [telefone, id_visitante]
      );

      if (telefoneExistente.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ erro: 'Telefone já está em uso por outro visitante' });
      }
    }

    // Atualizar visitante
    const campos = [];
    const valores = [];
    let indice = 1;

    if (nome) {
      campos.push(`nome = $${indice}`);
      valores.push(nome);
      indice++;
    }

    if (telefone) {
      campos.push(`telefone = $${indice}`);
      valores.push(telefone);
      indice++;
    }

    valores.push(id_visitante);

    const result = await client.query(
      `UPDATE "Visitantes" 
       SET ${campos.join(', ')}, data_alteracao = NOW() 
       WHERE id_visitante = $${indice}
       RETURNING id_visitante, nome, telefone, chave_acesso, data_criacao, data_alteracao`,
      valores
    );

    // Commit da transação
    await client.query('COMMIT');

    return res.status(200).json({
      mensagem: 'Visitante atualizado com sucesso',
      dados: result.rows[0]
    });
  } catch (erro) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar visitante:', erro);
    return res.status(500).json({
      erro: 'Erro ao atualizar visitante',
      detalhes: process.env.NODE_ENV === 'development' ? erro.message : undefined
    });
  } finally {
    await client.end();
  }
}