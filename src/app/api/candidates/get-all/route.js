import { openDb } from "@/lib/db";

export async function GET(request) {
  try {
    const db = await openDb();
    const candidatos = await db.all("SELECT * FROM Candidatos");

    return new Response(
      JSON.stringify({ success: true, data: candidatos }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar candidatos:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno no servidor", 
        details: process.env.NODE_ENV === "development" ? error.message : undefined 
      }),
      { status: 500 }
    );
  }
}