import { openDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const {
      nome,
      email_institucional,
      telefone,
      senha,
      turma_atual,
      foto,
      deseja_ser_candidato,
      link_video,
      descricao_campanha
    } = await req.json();

    const db = await openDb();

    // Inicia a transação
    await db.run("BEGIN TRANSACTION");

    // Verificar se candidato já existe
    const existing = await db.get(
      "SELECT * FROM Candidatos WHERE email_institucional = ?",
      [email_institucional]
    );

    if (existing) {
      return new Response(JSON.stringify({ error: "Candidato já cadastrado" }), { status: 409 });
    }

    // Processar upload da foto
    let fotoPath = null;
    if (foto && foto.size > 0) {
      try {
        const buffer = Buffer.from(await foto.arrayBuffer());
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(foto.name || "").toLowerCase() || ".jpg";
        fotoPath = `/uploads/candidatos/foto-${uniqueSuffix}${ext}`;
        const uploadPath = path.join(process.cwd(), "public", fotoPath);
        await writeFile(uploadPath, buffer);
      } catch (error) {
        return new Response(JSON.stringify({ error: "Erro ao salvar a foto" }), { status: 500 });
      }
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir candidato no banco
    const result = await db.run(
      `INSERT INTO Candidatos (
        email_institucional, telefone, senha, nome, turma_atual, foto, 
        deseja_ser_candidato, link_video, descricao_campanha
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email_institucional, telefone, senhaHash, nome, turma_atual, fotoPath, deseja_ser_candidato ? 1 : 0, link_video, descricao_campanha]
    );

    const candidatoId = result.lastID;

    // Finaliza a transação
    await db.run("COMMIT");

    return new Response(JSON.stringify({ message: "Candidato registrado com sucesso!", candidatoId }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao cadastrar candidato:", error);

    return new Response(JSON.stringify({ error: "Erro ao cadastrar candidato" }), { status: 500 });
  }
}
