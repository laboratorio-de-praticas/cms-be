import { openDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import path from "path";

function isAdminByEmail(userEmail) {
  const adminEmail = "admin@fatec.sp.gov.br";
  return userEmail === adminEmail;
}

export async function PUT(request, user) {
  try {
    const formData = await request.formData();

    const ra = formData.get("ra");
    const nome = formData.get("nome");
    let email_institucional = formData.get("email_institucional");
    const telefone = formData.get("telefone");
    const senha = formData.get("senha");
    const turma_atual = formData.get("turma_atual");
    const foto = formData.get("foto");
    const deseja_ser_candidato = formData.get("deseja_ser_candidato") === "true";
    const link_video = formData.get("link_video");
    const descricao_campanha = formData.get("descricao_campanha");
    let curso = formData.get("curso");
    const semestre = formData.get("semestre");
    let ano_ingresso = formData.get("ano_ingresso");

    if (!ra) {
      return new Response(
        JSON.stringify({ error: "RA é obrigatório para atualizar o candidato" }),
        { status: 400 }
      );
    }

    const db = await openDb();

    const existing = await db.get("SELECT * FROM Candidatos WHERE ra = ?", [ra]);
    if (!existing) {
      return new Response(
        JSON.stringify({ error: "Candidato não encontrado" }),
        { status: 404 }
      );
    }

    if (!isAdminByEmail(user.email)) {
      email_institucional = existing.email_institucional; 
      curso = existing.curso;
      ano_ingresso = existing.ano_ingresso;
    }

    let fotoPath = existing.foto;
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

    let senhaHash = existing.senha;
    if (senha) {
      senhaHash = await bcrypt.hash(senha, 10);
    }

    await db.run(
      `UPDATE Candidatos SET 
        nome = ?, email_institucional = ?, telefone = ?, senha = ?, turma_atual = ?, 
        foto = ?, deseja_ser_candidato = ?, link_video = ?, descricao_campanha = ?, 
        curso = ?, semestre = ?, ano_ingresso = ?
      WHERE ra = ?`,
      [
        nome || existing.nome,
        email_institucional || existing.email_institucional,
        telefone || existing.telefone,
        senhaHash,
        turma_atual || existing.turma_atual,
        fotoPath,
        deseja_ser_candidato ? 1 : 0,
        link_video || existing.link_video,
        descricao_campanha || existing.descricao_campanha,
        curso || existing.curso,
        semestre || existing.semestre,
        ano_ingresso || existing.ano_ingresso,
        ra
      ]
    );

    return new Response(
      JSON.stringify({ success: true, message: "Candidato atualizado com sucesso!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na atualização:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno no servidor" }),
      { status: 500 }
    );
  }
}
