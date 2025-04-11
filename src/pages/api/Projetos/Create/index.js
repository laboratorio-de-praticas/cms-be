import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import conectar_banco from '@/config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  let db;
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ mensagem: auth.mensagem });
    // }

    const {
      nome_projeto,
      nome_equipe,
      tlr,
      turma,
      descricao,
      cea,
      area_atuacao,
      ods_ids,
      linhas_extensao_ids,
      areas_tematicas_ids,
      integrantes_ids
    } = req.body;

    // Validação dos campos obrigatórios
    const camposObrigatorios = ['nome_projeto', 'nome_equipe', 'tlr', 'turma', 'descricao', 'cea', 'area_atuacao'];
    for (const campo of camposObrigatorios) {
      const valor = req.body[campo];
      if (!valor || String(valor).trim() === '') {
        return res.status(400).json({ erro: `Campo ${campo} é obrigatório e não pode estar vazio` });
      }
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Iniciar transação
    await db.run('BEGIN TRANSACTION');

    try {
      // Inserir projeto no banco
      const stmt = await db.prepare(`
        INSERT INTO Projetos (
          nome_projeto, nome_equipe, tlr, imagem_capa, turma, 
          descricao, cea, area_atuacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      await stmt.run(
        String(nome_projeto).trim(),
        String(nome_equipe).trim(),
        parseInt(tlr),
        '/imgs/projetos/capa/padrao.png', // Imagem padrão
        String(turma).trim(),
        String(descricao).trim(),
        parseInt(cea),
        String(area_atuacao).trim()
      );

      await stmt.finalize();
      console.log('Projeto inserido com sucesso');

      // Obter o ID do projeto inserido
      const id_projeto = await new Promise((resolve, reject) => {
        db.get('SELECT last_insert_rowid() as id', (err, row) => {
          if (err) reject(err);
          resolve(row.id);
        });
      });

      console.log('ID do projeto:', id_projeto);

      if (!id_projeto) {
        throw new Error('Não foi possível obter o ID do projeto inserido');
      }

      // Processar ODS
      if (ods_ids && Array.isArray(ods_ids)) {
        for (const odsId of ods_ids) {
          await db.run(
            'INSERT INTO ProjetoODS (projeto_id, ods_id) VALUES (?, ?)',
            [id_projeto, odsId]
          );
        }
      }

      // Processar Linhas de Extensão
      if (linhas_extensao_ids && Array.isArray(linhas_extensao_ids)) {
        for (const linhaId of linhas_extensao_ids) {
          await db.run(
            'INSERT INTO ProjetoLinhaExtensao (projeto_id, linha_extensao_id) VALUES (?, ?)',
            [id_projeto, linhaId]
          );
        }
      }

      // Processar Áreas Temáticas
      if (areas_tematicas_ids && Array.isArray(areas_tematicas_ids)) {
        for (const areaId of areas_tematicas_ids) {
          await db.run(
            'INSERT INTO ProjetoAreaTematica (projeto_id, area_tematica_id) VALUES (?, ?)',
            [id_projeto, areaId]
          );
        }
      }

      // Processar Integrantes
      if (integrantes_ids && Array.isArray(integrantes_ids)) {
        for (const integranteId of integrantes_ids) {
          await db.run(
            'INSERT INTO IntegrantesEquipe (projeto_id, usuario_id) VALUES (?, ?)',
            [id_projeto, integranteId]
          );
        }
      }

      // Commit da transação
      await db.run('COMMIT');

      // Buscar o projeto inserido para confirmar
      const projetoInserido = await db.get(
        'SELECT * FROM Projetos WHERE id_projeto = ?',
        [id_projeto]
      );

      if (!projetoInserido) {
        throw new Error('Projeto não foi encontrado após inserção');
      }

      console.log('Projeto confirmado no banco:', projetoInserido);

      return res.status(201).json({
        mensagem: 'Projeto criado com sucesso',
        projeto: {
          id_projeto,
          nome_projeto: String(nome_projeto).trim(),
          nome_equipe: String(nome_equipe).trim(),
          tlr: parseInt(tlr),
          turma: String(turma).trim(),
          descricao: String(descricao).trim(),
          cea: parseInt(cea),
          area_atuacao: String(area_atuacao).trim(),
          imagem_capa: '/imgs/projetos/capa/padrao.png'
        }
      });

    } catch (error) {
      // Rollback em caso de erro
      await db.run('ROLLBACK');
      console.error('Erro ao inserir projeto:', error);
      throw error;
    }

  } catch (error) {
    console.error('Erro ao criar projeto:', error);
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
