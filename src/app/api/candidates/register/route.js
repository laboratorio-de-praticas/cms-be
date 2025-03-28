import { openDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const ra = formData.get("ra"); 
    const nome = formData.get("nome");
    const email_institucional = formData.get("email_institucional");
    const telefone = formData.get("telefone");
    const senha = formData.get("senha");
    const turma_atual = formData.get("turma_atual");
    const foto = formData.get("foto");
    const deseja_ser_candidato = formData.get("deseja_ser_candidato") === "true";
    const link_video = formData.get("link_video");
    const descricao_campanha = formData.get("descricao_campanha");

    const curso = formData.get("curso");
    const semestre = formData.get("semestre");
    const ano_ingresso = formData.get("ano_ingresso");

    if (!ra || !nome || !email_institucional || !telefone || !senha || !turma_atual || !curso || !semestre || !ano_ingresso) {
      return new Response(
        JSON.stringify({ 
          error: "Campos obrigatórios faltando",
          missing_fields: {
            ra: !ra,
            nome: !nome,
            email_institucional: !email_institucional,
            telefone: !telefone,
            senha: !senha,
            turma_atual: !turma_atual,
            curso: !curso,
            semestre: !semestre,
            ano_ingresso: !ano_ingresso
          }
        }), 
        { status: 400 }
      );
    }

    if (!email_institucional.endsWith("@fatec.sp.gov.br")) {
      return new Response(
        JSON.stringify({ error: "Email institucional inválido" }),
        { status: 400 }
      );
    }

    const db = await openDb();

    const existing = await db.get(
      "SELECT * FROM Candidatos WHERE ra = ? OR email_institucional = ?",
      [ra, email_institucional]
    );

    if (existing) {
      return new Response(
        JSON.stringify({ 
          error: "Candidato já cadastrado",
          conflict: existing.ra === ra ? "RA já existe" : "Email já cadastrado"
        }),
        { status: 409 }
      );
    }

    let fotoPath = "/uploads/default-profile.jpg";
    if (foto && foto.size > 0) {
      try {
        const buffer = Buffer.from(await foto.arrayBuffer());
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(foto.name || "").toLowerCase() || ".jpg";
        fotoPath = `/uploads/candidatos/foto-${uniqueSuffix}${ext}`;
        const uploadPath = path.join(process.cwd(), "public", fotoPath);
        await writeFile(uploadPath, buffer);
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Erro ao salvar a foto" }),
          { status: 500 }
        );
      }
    }

    // Criptografar senha (mantido igual)
    const senhaHash = await bcrypt.hash(senha, 10);

    await db.run(
      `INSERT INTO Candidatos (
        ra, email_institucional, telefone, senha, nome, turma_atual, foto, 
        deseja_ser_candidato, link_video, descricao_campanha, curso, semestre, ano_ingresso
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ra, email_institucional, telefone, senhaHash, nome, turma_atual, 
       fotoPath || "", 
       deseja_ser_candidato ? 1 : 0, link_video || null, descricao_campanha || null,
       curso, semestre, ano_ingresso]
    );    

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Candidato registrado com sucesso!",
        data: { ra, nome, email: email_institucional }
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro no registro:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno no servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      }),
      { status: 500 }
    );
  }
}
