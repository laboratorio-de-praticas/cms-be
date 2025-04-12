import { conectar_banco } from '@/config/database';
import bcryptjs from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ mensagem: 'ID do usuário não fornecido' });
  }

  // Valida se o ID é um número válido
  if (isNaN(Number(id))) {
    return res.status(400).json({ mensagem: 'ID do usuário inválido' });
  }

  const client = await conectar_banco();

  try {
    const { 
      nome,
      email_institucional,
      senha,
      telefone,
      status_usuario,
      dados_aluno
    } = req.body;

    // Validações básicas
    if (!nome || !email_institucional) {
      return res.status(400).json({ mensagem: 'Nome e email institucional são obrigatórios' });
    }

    // Verifica se o usuário existe
    const usuarioExistente = await client.query(
      'SELECT * FROM "Usuarios" WHERE id = $1',
      [id]
    );

    if (usuarioExistente.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    const usuario = usuarioExistente.rows[0];

    // Verifica se o email já está em uso por outro usuário
    if (email_institucional !== usuario.email_institucional) {
      const emailExistente = await client.query(
        'SELECT id FROM "Usuarios" WHERE email_institucional = $1 AND id != $2',
        [email_institucional, id]
      );

      if (emailExistente.rows.length > 0) {
        return res.status(400).json({ mensagem: 'Email institucional já está em uso' });
      }
    }

    // Inicia a transação
    await client.query('BEGIN');

    try {
      // Prepara os dados para atualização
      const camposAtualizacao = [];
      const valoresAtualizacao = [];
      let contador = 1;

      if (nome) {
        camposAtualizacao.push(`nome = $${contador}`);
        valoresAtualizacao.push(nome);
        contador++;
      }

      if (email_institucional) {
        camposAtualizacao.push(`email_institucional = $${contador}`);
        valoresAtualizacao.push(email_institucional);
        contador++;
      }

      if (senha) {
        const senhaHash = await bcryptjs.hash(senha, 10);
        camposAtualizacao.push(`senha = $${contador}`);
        valoresAtualizacao.push(senhaHash);
        contador++;
      }

      if (telefone !== undefined) {
        camposAtualizacao.push(`telefone = $${contador}`);
        valoresAtualizacao.push(telefone);
        contador++;
      }

      if (status_usuario) {
        camposAtualizacao.push(`status_usuario = $${contador}`);
        valoresAtualizacao.push(status_usuario);
        contador++;
      }

      // Adiciona o ID ao final dos valores
      valoresAtualizacao.push(id);

      // Atualiza o usuário
      const queryUpdateUsuario = `
        UPDATE "Usuarios"
        SET ${camposAtualizacao.join(', ')}
        WHERE id = $${contador}
        RETURNING *
      `;

      const resultUsuario = await client.query(queryUpdateUsuario, valoresAtualizacao);

      // Se for um aluno e houver dados para atualizar
      if (usuario.tipo_usuario === 'Interno' && dados_aluno) {
        const camposAluno = [];
        const valoresAluno = [];
        let contadorAluno = 1;

        if (dados_aluno.ra) {
          // Verifica se o RA já está em uso por outro aluno
          const raExistente = await client.query(
            'SELECT id_aluno FROM "Alunos" WHERE ra = $1 AND fk_id_usuario != $2',
            [dados_aluno.ra, id]
          );

          if (raExistente.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ mensagem: 'RA já está em uso por outro aluno' });
          }

          camposAluno.push(`ra = $${contadorAluno}`);
          valoresAluno.push(dados_aluno.ra);
          contadorAluno++;
        }

        if (dados_aluno.curso_semestre) {
          camposAluno.push(`curso_semestre = $${contadorAluno}`);
          valoresAluno.push(dados_aluno.curso_semestre);
          contadorAluno++;
        }

        if (dados_aluno.deseja_ser_candidato !== undefined) {
          camposAluno.push(`deseja_ser_candidato = $${contadorAluno}`);
          valoresAluno.push(dados_aluno.deseja_ser_candidato);
          contadorAluno++;
        }

        if (camposAluno.length > 0) {
          valoresAluno.push(id);

          const queryUpdateAluno = `
            UPDATE "Alunos"
            SET ${camposAluno.join(', ')}
            WHERE fk_id_usuario = $${contadorAluno}
            RETURNING *
          `;

          await client.query(queryUpdateAluno, valoresAluno);
        }
      }

      // Commit da transação
      await client.query('COMMIT');

      // Busca os dados atualizados
      const queryUsuarioAtualizado = `
        SELECT 
          u.*,
          a.id_aluno,
          a.ra,
          a.curso_semestre,
          a.deseja_ser_candidato
        FROM "Usuarios" u
        LEFT JOIN "Alunos" a ON u.id = a.fk_id_usuario
        WHERE u.id = $1
      `;

      const resultAtualizado = await client.query(queryUsuarioAtualizado, [id]);
      const usuarioAtualizado = resultAtualizado.rows[0];

      // Remove a senha do retorno
      delete usuarioAtualizado.senha;

      // Organiza os dados do aluno se existirem
      if (usuarioAtualizado.id_aluno) {
        usuarioAtualizado.dados_aluno = {
          id_aluno: usuarioAtualizado.id_aluno,
          ra: usuarioAtualizado.ra,
          curso_semestre: usuarioAtualizado.curso_semestre,
          deseja_ser_candidato: usuarioAtualizado.deseja_ser_candidato
        };
        delete usuarioAtualizado.id_aluno;
        delete usuarioAtualizado.ra;
        delete usuarioAtualizado.curso_semestre;
        delete usuarioAtualizado.deseja_ser_candidato;
      }

      return res.status(200).json({
        mensagem: 'Usuário atualizado com sucesso',
        dados: usuarioAtualizado
      });
    } catch (error) {
      // Rollback em caso de erro
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({
      mensagem: 'Erro ao atualizar usuário',
      detalhes: error.message
    });
  } finally {
    client.release();
  }
} 