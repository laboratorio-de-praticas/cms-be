import { openDb } from "@/lib/db";

export async function POST(req) {
  try {
    const { 
      nome_Projeto, 
      nome_equipe, 
      tlr, 
      imagem_capa, 
      turma, 
      descricao, 
      cea, 
      area_atuacao, 
      ods_ids,                // Lista de IDs das ODS selecionadas
      linha_extensao_ids,     // Lista de IDs das Linhas de Extensão selecionadas
      area_tematica_ids       // Lista de IDs das Áreas Temáticas selecionadas
    } = await req.json();

    const db = await openDb();

    // Inicia a transação
    await db.run("BEGIN TRANSACTION");

    const result = await db.run(
      `INSERT INTO Projetos (nome_Projeto, nome_equipe, tlr, imagem_capa, turma, descricao, cea, area_atuacao) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome_Projeto, nome_equipe, tlr, imagem_capa, turma, descricao, cea, area_atuacao]
    );

    const projetoId = result.lastID;


    // Insere os ODS selecionados
    if (ods_ids && ods_ids.length > 0) {
      for (const ods_id of ods_ids) {
        await db.run(`INSERT INTO ProjetoODS (projeto_id, ods_id) VALUES (?, ?)`, [projetoId, ods_id]);
      }
    }

    // Insere as Linhas de Extensão selecionadas
    if (linha_extensao_ids && linha_extensao_ids.length > 0) {
      for (const linha_id of linha_extensao_ids) {
        await db.run(`INSERT INTO ProjetoLinhaExtensao (projeto_id, linha_extensao_id) VALUES (?, ?)`, [projetoId, linha_id]);
      }
    }

    // Insere as Áreas Temáticas selecionadas
    if (area_tematica_ids && area_tematica_ids.length > 0) {
      for (const area_id of area_tematica_ids) {
        await db.run(`INSERT INTO ProjetoAreaTematica (projeto_id, area_tematica_id) VALUES (?, ?)`, [projetoId, area_id]);
      }
    }

    // Finaliza a transação
    await db.run("COMMIT");

    return new Response(JSON.stringify({ message: "Projeto cadastrado com sucesso!", projetoId }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro ao cadastrar projeto:", error);

    return new Response(JSON.stringify({ error: "Erro ao cadastrar projeto" }), { status: 500 });
  }
}
