import { openDb } from "@/lib/db";

export async function PATCH(request) {
  try {
    const { ra, status } = await request.json();

    if (!ra || !status) {
      return new Response(
        JSON.stringify({ error: "RA e status são obrigatórios" }),
        { status: 400 }
      );
    }

    if (!["aprovado", "rejeitado"].includes(status)) {
      return new Response(
        JSON.stringify({ error: "Status inválido. Use 'aprovado' ou 'rejeitado'" }),
        { status: 400 }
      );
    }

    const db = await openDb();

    const candidato = await db.get("SELECT * FROM Candidatos WHERE ra = ?", [ra]);
    if (!candidato) {
      return new Response(
        JSON.stringify({ error: "Candidato não encontrado" }),
        { status: 404 }
      );
    }

    await db.run("UPDATE Candidatos SET status_candidatura = ? WHERE ra = ?", [status, ra]);

    return new Response(
      JSON.stringify({ success: true, message: "Status atualizado com sucesso" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar status da candidatura:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno no servidor" }),
      { status: 500 }
    );
  }
}