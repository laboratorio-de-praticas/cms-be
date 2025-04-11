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
    const { id_candidato, acao } = req.body;

    if (!id_candidato || !acao) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios faltando',
        campos_faltando: {
          id_candidato: !id_candidato,
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

    // Iniciar transação
    await db.run('BEGIN TRANSACTION');

    try {
      // Verificar se o candidato existe
      const candidato = await new Promise((resolve, reject) => {
        db.get(`
          SELECT c.*, u.* 
          FROM Candidato c
          JOIN Usuario u ON c.id_usuario = u.id_usuario
          WHERE c.id_candidato = ?
        `, [id_candidato], (err, row) => {
          if (err) {
            console.error('Erro ao verificar candidato:', err);
            reject(err);
          }
          resolve(row);
        });
      });

      if (!candidato) {
        await db.run('ROLLBACK');
        return res.status(404).json({ erro: 'Candidato não encontrado' });
      }

      if (candidato.tipo_usuario !== 'aluno') {
        await db.run('ROLLBACK');
        return res.status(400).json({ erro: 'Apenas alunos podem ser candidatos' });
      }

      if (acao === 'aprovar') {
        // Buscar evento ativo
        const evento = await new Promise((resolve, reject) => {
          db.get(`
            SELECT id_evento, nome_evento 
            FROM Eventos 
            WHERE ativo = 1 
            ORDER BY id_evento DESC 
            LIMIT 1
          `, (err, row) => {
            if (err) {
              console.error('Erro ao buscar evento ativo:', err);
              reject(err);
            }
            resolve(row);
          });
        });

        if (!evento) {
          await db.run('ROLLBACK');
          return res.status(404).json({ erro: 'Nenhum evento ativo encontrado' });
        }

        // Verificar se o candidato já está inscrito no evento
        const inscricao = await new Promise((resolve, reject) => {
          db.get(`
            SELECT * FROM EventoxCandidato 
            WHERE id_evento = ? AND id_candidato = ?
          `, [evento.id_evento, id_candidato], (err, row) => {
            if (err) {
              console.error('Erro ao verificar inscrição:', err);
              reject(err);
            }
            resolve(row);
          });
        });

        if (inscricao) {
          await db.run('ROLLBACK');
          return res.status(400).json({ erro: 'Candidato já está inscrito no evento ativo' });
        }

        // Gerar URL de votação
        const url_votacao = `/votacao/interna/confirmacao/${id_candidato}/${evento.id_evento}`;

        // Atualizar status do candidato
        const stmtCandidato = await db.prepare(`
          UPDATE Candidato SET
            deseja_ser_candidato = 1
          WHERE id_candidato = ?
        `);

        await stmtCandidato.run(id_candidato);
        await stmtCandidato.finalize();

        // Adicionar candidato ao evento
        const stmtEvento = await db.prepare(`
          INSERT INTO EventoxCandidato (
            id_evento, id_candidato, url_votacao
          ) VALUES (?, ?, ?)
        `);

        await stmtEvento.run(evento.id_evento, id_candidato, url_votacao);
        await stmtEvento.finalize();

        // Commit da transação
        await db.run('COMMIT');

        return res.status(200).json({
          mensagem: 'Candidato aprovado e adicionado ao evento com sucesso',
          dados: {
            id_candidato,
            id_evento: evento.id_evento,
            nome_evento: evento.nome_evento,
            url_votacao
          }
        });

      } else {
        // Reprovar candidato
        const stmtCandidato = await db.prepare(`
          UPDATE Candidato SET
            deseja_ser_candidato = 0
          WHERE id_candidato = ?
        `);

        await stmtCandidato.run(id_candidato);
        await stmtCandidato.finalize();

        // Commit da transação
        await db.run('COMMIT');

        return res.status(200).json({
          mensagem: 'Candidato reprovado com sucesso',
          dados: { id_candidato }
        });
      }

    } catch (error) {
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