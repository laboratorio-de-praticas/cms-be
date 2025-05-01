import { conectar_banco } from '../../../../config/database'; 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const {
    fk_id_usuario,
    ra,
    curso_semestre,
    deseja_ser_candidato,
    foto_url,
    data_matricula,
    fk_id_evento,
    descricao_campanha,
    acao,  // Aqui está o valor "const"
    id_aluno,
  } = req.body;

  const client = await conectar_banco();

  try {
    await client.query('BEGIN');

    // --- TRATAMENTO DE ACEITAÇÃO/RECUSA DE REPRESENTANTE ---
    if (acao && id_aluno && fk_id_evento) {
      let acaoAlterada = acao; // Altere para let, permitindo a modificação da variável
      // Traduzindo "Aceito" e "Recusado" para "Ativo" e "Desligado"
      if (acaoAlterada === 'Aceito') acaoAlterada = 'Ativo';
      if (acaoAlterada === 'Recusado') acaoAlterada = 'Desligado';

      if (!['Ativo', 'Desligado'].includes(acaoAlterada)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ mensagem: 'Ação inválida', detalhes: 'Ação deve ser "Ativo" ou "Desligado"' });
      }

      const representante = await client.query(
        `SELECT * FROM "Representantes" 
         WHERE fk_id_aluno = $1 AND fk_id_evento = $2`,
        [id_aluno, fk_id_evento]
      );

      if (representante.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          mensagem: 'Representante não encontrado',
          detalhes: 'Não existe representante com esse aluno e evento',
        });
      }

      await client.query(
        `UPDATE "Representantes"
         SET representantesituacao = $1
         WHERE fk_id_aluno = $2 AND fk_id_evento = $3`,
        [acaoAlterada, id_aluno, fk_id_evento]
      );

      await client.query('COMMIT');
      return res.status(200).json({
        mensagem: acaoAlterada === 'Ativo'
          ? 'Representante aceito com sucesso!'
          : 'Representante recusado com sucesso!',
      });
    }

    // --- TRATAMENTO DE CADASTRO DE ALUNO ---
    if (!fk_id_usuario || !ra || !curso_semestre || !data_matricula) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        mensagem: 'Campos obrigatórios não fornecidos',
        campos_necessarios: ['fk_id_usuario', 'ra', 'curso_semestre', 'data_matricula'],
      });
    }

    const usuarioExistente = await client.query(
      `SELECT * FROM "Usuarios" WHERE id = $1 AND tipo_usuario = 'Interno'`,
      [fk_id_usuario]
    );

    if (usuarioExistente.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        mensagem: 'Usuário não encontrado ou não é do tipo Interno',
        detalhes: 'O ID de usuário fornecido deve pertencer a um usuário do tipo Interno',
      });
    }

    const alunoExistente = await client.query(
      'SELECT * FROM "Alunos" WHERE fk_id_usuario = $1',
      [fk_id_usuario]
    );

    if (alunoExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        mensagem: 'Aluno já cadastrado',
        detalhes: 'Este usuário já possui um registro como aluno',
      });
    }

    const raExistente = await client.query(
      'SELECT * FROM "Alunos" WHERE ra = $1',
      [ra]
    );

    if (raExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        mensagem: 'RA já cadastrado',
        detalhes: 'Este RA já está sendo utilizado por outro aluno',
      });
    }

    const result = await client.query(
      `INSERT INTO "Alunos" 
       (fk_id_usuario, ra, curso_semestre, deseja_ser_candidato, foto_url, data_matricula) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        fk_id_usuario,
        ra,
        curso_semestre,
        deseja_ser_candidato || false,
        foto_url || null,
        data_matricula,
      ]
    );

    const alunoCriado = result.rows[0];

    if (deseja_ser_candidato === true) {
      if (!fk_id_evento) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          mensagem: 'ID do evento não fornecido',
          detalhes: 'Para candidatos, é necessário informar o ID do evento',
        });
      }

      const eventoExistente = await client.query(
        `SELECT * FROM "Eventos" WHERE id_evento = $1`,
        [fk_id_evento]
      );

      if (eventoExistente.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          mensagem: 'Evento não encontrado',
          detalhes: `Nenhum evento com ID ${fk_id_evento} foi encontrado`,
        });
      }

      const representanteExistente = await client.query(
        `SELECT * FROM "Representantes" 
         WHERE fk_id_aluno = $1 AND fk_id_evento = $2`,
        [alunoCriado.id_aluno, fk_id_evento]
      );

      if (representanteExistente.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          mensagem: 'Aluno já é representante neste evento',
          detalhes: 'Este aluno já está cadastrado como representante para este evento',
        });
      }

      await client.query(
        `INSERT INTO "Representantes" 
         (fk_id_aluno, fk_id_evento, representantesituacao, descricao_campanha)
         VALUES ($1, $2, 'Pendente', $3)`,
        [alunoCriado.id_aluno, fk_id_evento, descricao_campanha || null]
      );
    }

    await client.query(
      `UPDATE "Usuarios" SET status_usuario = 'Ativo' WHERE id = $1`,
      [fk_id_usuario]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      mensagem: 'Aluno cadastrado com sucesso!',
      aluno: alunoCriado,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro:', error);
    return res.status(500).json({
      mensagem: 'Erro interno',
      detalhes: error.message,
    });
  } finally {
    client.release();
  }
}
