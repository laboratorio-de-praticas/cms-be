import conectar_banco from '@/config/database';
import authMiddleware from '@/middleware/authMiddleware';
import { promises as fs } from 'fs';
import path from 'path';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    const { id_usuario, acao } = req.body;

    if (!id_usuario || !acao) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios faltando',
        campos_faltando: {
          id_usuario: !id_usuario,
          acao: !acao
        }
      });
    }

    if (!['aprovar', 'reprovar'].includes(acao)) {
      return res.status(400).json({ 
        erro: 'Ação inválida',
        mensagem: "Use 'aprovar' ou 'reprovar'",
        acao_recebida: acao
      });
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Verificar se o usuário existe e é um candidato
    const usuario = await db.get(
      'SELECT * FROM Usuario WHERE id_usuario = ?',
      [id_usuario]
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    if (usuario.tipo_usuario !== 'aluno') {
      return res.status(400).json({ erro: 'Apenas alunos podem ser candidatos' });
    }

    // Buscar o candidato
    const candidato = await db.get(
      'SELECT * FROM Candidatos WHERE id_usuario = ?',
      [id_usuario]
    );

    if (!candidato) {
      return res.status(404).json({ erro: 'Candidato não encontrado' });
    }

    // Iniciar transação
    await db.run('BEGIN TRANSACTION');

    try {
      if (acao === 'aprovar') {
        // Buscar evento ativo
        const evento = await db.get(
          'SELECT * FROM Eventos WHERE ativo = 1 ORDER BY data_inicio DESC LIMIT 1'
        );

        if (!evento) {
          return res.status(404).json({ erro: 'Nenhum evento ativo encontrado' });
        }

        // Verificar se o candidato já está inscrito no evento
        const inscricao = await db.get(
          'SELECT * FROM EventoCandidato WHERE id_evento = ? AND id_candidato = ?',
          [evento.id_evento, candidato.id]
        );

        if (inscricao) {
          return res.status(400).json({ erro: 'Candidato já está inscrito no evento ativo' });
        }

        // Gerar URL de confirmação
        const url_confirmacao = `${process.env.NEXT_PUBLIC_API_URL}/votacao/interna/confirmacao/${evento.id_evento}/${candidato.id}`;

        // Atualizar status do candidato
        await db.run(
          'UPDATE Candidatos SET status_candidatura = "aprovado", deseja_ser_candidato = 1 WHERE id = ?',
          [candidato.id]
        );

        // Adicionar candidato ao evento
        await db.run(
          'INSERT INTO EventoCandidato (id_evento, id_candidato, url_confirmacao) VALUES (?, ?, ?)',
          [evento.id_evento, candidato.id, url_confirmacao]
        );

        // Commit da transação
        await db.run('COMMIT');

        return res.status(200).json({
          mensagem: 'Candidato aprovado e adicionado ao evento com sucesso',
          dados: {
            id_candidato: candidato.id,
            id_evento: evento.id_evento,
            url_confirmacao
          }
        });

      } else { // reprovar
        // Atualizar status do candidato
        await db.run(
          'UPDATE Candidatos SET status_candidatura = "reprovado", deseja_ser_candidato = 0 WHERE id = ?',
          [candidato.id]
        );

        // Commit da transação
        await db.run('COMMIT');

        return res.status(200).json({
          mensagem: 'Candidato reprovado com sucesso',
          dados: {
            id_candidato: candidato.id,
            status: 'reprovado'
          }
        });
      }

    } catch (error) {
      // Rollback em caso de erro
      await db.run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erro ao processar candidatura:', error);
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