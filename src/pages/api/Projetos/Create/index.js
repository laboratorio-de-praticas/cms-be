import { conectar_banco } from "../../../../config/database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ mensagem: "Método não permitido" });
  }

  const client = await conectar_banco();

  try {
    const {
      titulo,
      nome_equipe,
      descricao,
      foto_url,
      tlr,
      cea,
      turma,
      imagens,
      integrantes,
      ods,
      linhas_extensao,
      categorias
    } = req.body;

    // Validações básicas
    if (!titulo || !nome_equipe || !descricao || !tlr || !cea || !turma) {
      return res.status(400).json({ mensagem: "Campos obrigatórios não preenchidos" });
    }

    // Inicia transação
    await client.query('BEGIN');

    // Insere o projeto
    const projetoResult = await client.query(
      `INSERT INTO "Projetos" 
       (titulo, nome_equipe, descricao, foto_url, tlr, cea, turma) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id_projeto`,
      [titulo, nome_equipe, descricao, foto_url, tlr, cea, turma]
    );

    const id_projeto = projetoResult.rows[0].id_projeto;

    // Insere imagens se existirem
    if (imagens && imagens.length > 0) {
      for (const imagem of imagens) {
        await client.query(
          `INSERT INTO "ImagensProjeto" (projeto_id, imagem_url) 
           VALUES ($1, $2)`,
          [id_projeto, imagem.imagem_url]
        );
      }
    }

    // Insere integrantes se existirem
    if (integrantes && integrantes.length > 0) {
      for (const integrante of integrantes) {
        await client.query(
          `INSERT INTO "integrantesequipe" 
           (projeto_id, aluno_id) 
           VALUES ($1, $2)`,
          [id_projeto, integrante.aluno_id]
        );
      }
    }

    // Insere ODS se existirem
    if (ods && ods.length > 0) {
      for (const id_ods of ods) {
        await client.query(
          `INSERT INTO "ProjetoODS" (projeto_id, ods_id) 
           VALUES ($1, $2)`,
          [id_projeto, id_ods]
        );
      }
    }

    // Insere linhas de extensão se existirem
    if (linhas_extensao && linhas_extensao.length > 0) {
      for (const id_linha of linhas_extensao) {
        await client.query(
          `INSERT INTO "ProjetoLinhaExtensao" (projeto_id, linha_extensao_id) 
           VALUES ($1, $2)`,
          [id_projeto, id_linha]
        );
      }
    }

    // Insere categorias se existirem
    if (categorias && categorias.length > 0) {
      for (const id_categoria of categorias) {
        await client.query(
          `INSERT INTO "CategoriasProjetos" (fk_id_projeto, fk_id_categoria) 
           VALUES ($1, $2)`,
          [id_projeto, id_categoria]
        );
      }
    }

    // Commit da transação
    await client.query('COMMIT');

    return res.status(201).json({
      mensagem: "Projeto criado com sucesso",
      dados: {
        id_projeto,
        titulo,
        nome_equipe,
        descricao,
        foto_url,
        tlr,
        cea,
        turma
      }
    });

  } catch (erro) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar projeto:', erro);
    return res.status(500).json({
      mensagem: "Erro ao criar projeto",
      erro: process.env.NODE_ENV === 'development' ? erro.message : undefined
    });
  } finally {
    client.release();
  }
}
