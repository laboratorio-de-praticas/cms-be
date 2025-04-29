import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { conectar_banco } from '../../../../config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { id_projeto } = req.query;

  if (!id_projeto) {
    return res.status(400).json({ mensagem: 'ID do projeto não fornecido' });
  }

  // Processar o corpo da requisição usando formidable
  const form = new IncomingForm();
  const data = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ ...fields, ...files });
    });
  });

  const {
    titulo,
    nome_equipe,
    descricao,
    foto_url,
    tlr,
    cea,
    turma,
    ativo,
    imagens,
    integrantes,
    ods,
    linhas_extensao,
    categorias
  } = data;

  // Verifica se pelo menos um campo foi enviado para atualização
  if (!titulo && !nome_equipe && !descricao && !foto_url && 
      tlr === undefined && cea === undefined && !turma && 
      ativo === undefined && !imagens && !integrantes && 
      !ods && !linhas_extensao && !categorias) {
    return res.status(400).json({ 
      mensagem: 'Nenhum dado para atualizar',
      campos_disponiveis: [
        'titulo',
        'nome_equipe',
        'descricao',
        'foto_url',
        'tlr',
        'cea',
        'turma',
        'ativo',
        'imagens',
        'integrantes',
        'ods',
        'linhas_extensao',
        'categorias'
      ]
    });
  }

  const client = await conectar_banco();
  
  try {
    // Iniciar transação
    await client.query('BEGIN');

    // Verificar se o projeto existe
    const projetoExistente = await client.query(
      'SELECT * FROM "Projetos" WHERE id_projeto = $1',
      [id_projeto]
    );

    if (projetoExistente.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensagem: 'Projeto não encontrado' });
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (titulo !== undefined) {
      updateFields.push(`titulo = $${paramCount}`);
      updateValues.push(titulo);
      paramCount++;
    }

    if (nome_equipe !== undefined) {
      updateFields.push(`nome_equipe = $${paramCount}`);
      updateValues.push(nome_equipe);
      paramCount++;
    }

    if (descricao !== undefined) {
      updateFields.push(`descricao = $${paramCount}`);
      updateValues.push(descricao);
      paramCount++;
    }

    if (foto_url !== undefined) {
      updateFields.push(`foto_url = $${paramCount}`);
      updateValues.push(foto_url);
      paramCount++;
    }

    if (tlr !== undefined) {
      updateFields.push(`tlr = $${paramCount}`);
      updateValues.push(tlr);
      paramCount++;
    }

    if (cea !== undefined) {
      updateFields.push(`cea = $${paramCount}`);
      updateValues.push(cea);
      paramCount++;
    }

    if (turma !== undefined) {
      updateFields.push(`turma = $${paramCount}`);
      updateValues.push(turma);
      paramCount++;
    }

    if (ativo !== undefined) {
      updateFields.push(`ativo = $${paramCount}`);
      updateValues.push(ativo);
      paramCount++;
    }

    // Adicionar data_alteracao e id_projeto
    updateFields.push(`data_alteracao = CURRENT_TIMESTAMP`);
    updateValues.push(id_projeto);

    // Atualizar dados do projeto se houver campos para atualizar
    if (updateFields.length > 1) { // Mais de 1 porque sempre tem data_alteracao
      await client.query(
        `UPDATE "Projetos" 
         SET ${updateFields.join(', ')}
         WHERE id_projeto = $${paramCount}`,
        updateValues
      );
    }

    // Atualizar imagens se fornecidas
    if (imagens) {
      // Remover imagens existentes
      await client.query(
        'DELETE FROM "ImagensProjeto" WHERE projeto_id = $1',
        [id_projeto]
      );

      // Inserir novas imagens
      for (const imagem of imagens) {
        await client.query(
          'INSERT INTO "ImagensProjeto" (projeto_id, imagem_url) VALUES ($1, $2)',
          [id_projeto, imagem.imagem_url]
        );
      }
    }

    // Atualizar integrantes se fornecidos
    if (integrantes) {
      // Remover integrantes existentes
      await client.query(
        'DELETE FROM integrantesequipe WHERE projeto_id = $1',
        [id_projeto]
      );

      // Inserir novos integrantes
      for (const integrante of integrantes) {
        await client.query(
          'INSERT INTO integrantesequipe (projeto_id, aluno_id) VALUES ($1, $2)',
          [id_projeto, integrante.aluno_id]
        );
      }
    }

    // Atualizar ODS se fornecidos
    if (ods) {
      // Remover ODS existentes
      await client.query(
        'DELETE FROM "ProjetoODS" WHERE projeto_id = $1',
        [id_projeto]
      );

      // Inserir novos ODS
      for (const id_ods of ods) {
        await client.query(
          'INSERT INTO "ProjetoODS" (projeto_id, ods_id) VALUES ($1, $2)',
          [id_projeto, id_ods]
        );
      }
    }

    // Atualizar linhas de extensão se fornecidas
    if (linhas_extensao) {
      // Remover linhas existentes
      await client.query(
        'DELETE FROM "ProjetoLinhaExtensao" WHERE projeto_id = $1',
        [id_projeto]
      );

      // Inserir novas linhas
      for (const id_linha of linhas_extensao) {
        await client.query(
          'INSERT INTO "ProjetoLinhaExtensao" (projeto_id, linha_extensao_id) VALUES ($1, $2)',
          [id_projeto, id_linha]
        );
      }
    }

    // Atualizar categorias se fornecidas
    if (categorias) {
      // Remover categorias existentes
      await client.query(
        'DELETE FROM "CategoriasProjetos" WHERE fk_id_projeto = $1',
        [id_projeto]
      );

      // Inserir novas categorias
      for (const id_categoria of categorias) {
        await client.query(
          'INSERT INTO "CategoriasProjetos" (fk_id_projeto, fk_id_categoria) VALUES ($1, $2)',
          [id_projeto, id_categoria]
        );
      }
    }

    // Commit da transação
    await client.query('COMMIT');

    // Buscar projeto atualizado com todas as relações
    const projetoAtualizado = await client.query(
      `SELECT 
        p.id_projeto,
        p.titulo,
        p.nome_equipe,
        p.descricao,
        p.tlr,
        p.cea,
        p.turma,
        p.foto_url,
        p.ativo,
        p.data_criacao,
        p.data_alteracao,
        json_agg(DISTINCT jsonb_build_object(
          'id_imagem', ip.id_imagem,
          'imagem_url', ip.imagem_url
        )) as imagens,
        json_agg(DISTINCT jsonb_build_object(
          'id_ods', o.id_ods,
          'descricao', o.descricao
        )) as ods,
        json_agg(DISTINCT jsonb_build_object(
          'id_linha', le.id_linha,
          'descricao', le.descricao
        )) as linhas_extensao,
        json_agg(DISTINCT jsonb_build_object(
          'id_categoria', c.id_categoria,
          'nome', c.nome,
          'descricao', c.descricao
        )) as categorias,
        json_agg(DISTINCT jsonb_build_object(
          'id_integrante', ie.id_integrante,
          'id_aluno', ie.aluno_id,
          'nome', u.nome
        )) as integrantes
      FROM "Projetos" p
      LEFT JOIN "ImagensProjeto" ip ON p.id_projeto = ip.projeto_id
      LEFT JOIN "ProjetoODS" po ON p.id_projeto = po.projeto_id
      LEFT JOIN "ODS" o ON po.ods_id = o.id_ods
      LEFT JOIN "ProjetoLinhaExtensao" ple ON p.id_projeto = ple.projeto_id
      LEFT JOIN "LinhaExtensao" le ON ple.linha_extensao_id = le.id_linha
      LEFT JOIN "CategoriasProjetos" cp ON p.id_projeto = cp.fk_id_projeto
      LEFT JOIN "Categorias" c ON cp.fk_id_categoria = c.id_categoria
      LEFT JOIN integrantesequipe ie ON p.id_projeto = ie.projeto_id
      LEFT JOIN "Alunos" a ON ie.aluno_id = a.id_aluno
      LEFT JOIN "Usuarios" u ON a.fk_id_usuario = u.id
      WHERE p.id_projeto = $1
      GROUP BY p.id_projeto`,
      [id_projeto]
    );

    // Processa os resultados para remover valores nulos
    const projeto = {
      ...projetoAtualizado.rows[0],
      imagens: projetoAtualizado.rows[0].imagens[0] ? projetoAtualizado.rows[0].imagens.filter(img => img.id_imagem) : [],
      ods: projetoAtualizado.rows[0].ods[0] ? projetoAtualizado.rows[0].ods.filter(o => o.id_ods) : [],
      linhas_extensao: projetoAtualizado.rows[0].linhas_extensao[0] ? projetoAtualizado.rows[0].linhas_extensao.filter(le => le.id_linha) : [],
      categorias: projetoAtualizado.rows[0].categorias[0] ? projetoAtualizado.rows[0].categorias.filter(c => c.id_categoria) : [],
      integrantes: projetoAtualizado.rows[0].integrantes[0] ? projetoAtualizado.rows[0].integrantes.filter(i => i.id_integrante) : []
    };

    return res.status(200).json({
      mensagem: 'Projeto atualizado com sucesso',
      dados: projeto
    });

  } catch (erro) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar projeto:', erro);
    return res.status(500).json({ 
      mensagem: 'Erro interno do servidor',
      erro: process.env.NODE_ENV === 'development' ? erro.message : undefined
    });
  } finally {
    if (client) {
      await client.release();
    }
  }
} 