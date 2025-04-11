import { IncomingForm } from "formidable";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import conectar_banco from "@/config/database";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  let db;
  try {
    console.log("Iniciando processamento do formulário...");

    await fs.mkdir(path.join(process.cwd(), "public/imgs/candidatos"), {
      recursive: true,
    });
    console.log("Diretório de imgs criado/verificado");

    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), "public/imgs/candidatos"),
      keepExtensions: true,
    });

    console.log("Iniciando parse do form-data...");
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Erro no parse do form-data:", err);
          reject(err);
        }
        console.log("Form-data parseado com sucesso");
        resolve([fields, files]);
      });
    });

    const dadosJSON = fields.dados ? JSON.parse(fields.dados) : {};

    const id_candidato = dadosJSON.id_candidato || "";
    const id_usuario = dadosJSON.id_usuario || "";
    const ra = dadosJSON.ra || "";
    const nome = dadosJSON.nome || "";
    const email_institucional = dadosJSON.email_institucional || "";
    const telefone = dadosJSON.telefone || "";
    const senha = dadosJSON.senha || "";
    const turma_atual = dadosJSON.turma_atual || "";
    const deseja_ser_candidato = dadosJSON.deseja_ser_candidato || "false";
    const descricao_campanha = dadosJSON.descricao_campanha || "";

    console.log("Campos recebidos:", fields);
    console.log("Arquivos recebidos:", files);

    if (!id_candidato || !id_usuario || !ra || !nome || !email_institucional || !telefone || !turma_atual) {
      console.log("Campos obrigatórios faltando:", {
        id_candidato: !id_candidato,
        id_usuario: !id_usuario,
        ra: !ra,
        nome: !nome,
        email_institucional: !email_institucional,
        telefone: !telefone,
        turma_atual: !turma_atual
      });
      return res.status(400).json({
        erro: "Campos obrigatórios faltando",
        campos_faltando: {
          id_candidato: !id_candidato,
          id_usuario: !id_usuario,
          ra: !ra,
          nome: !nome,
          email_institucional: !email_institucional,
          telefone: !telefone,
          turma_atual: !turma_atual
        }
      });
    }

    if (!email_institucional.endsWith("@fatec.sp.gov.br")) {
      console.log("Email institucional inválido:", email_institucional);
      return res.status(400).json({
        erro: "Email institucional inválido",
        mensagem: "O email deve terminar com @fatec.sp.gov.br",
        email_recebido: email_institucional,
        email_esperado: "seu.nome@fatec.sp.gov.br"
      });
    }

    console.log("Conectando ao banco de dados...");
    db = await conectar_banco();
    console.log("Banco de dados conectado");

    // Iniciar transação
    await db.run("BEGIN TRANSACTION");

    try {
      // Verificar se o candidato existe
      const candidato = await new Promise((resolve, reject) => {
        db.get(`
          SELECT c.*, u.* 
          FROM Candidato c
          JOIN Usuario u ON c.id_usuario = u.id_usuario
          WHERE c.id_candidato = ? AND c.id_usuario = ?
        `, [id_candidato, id_usuario], (err, row) => {
          if (err) {
            console.error("Erro ao verificar candidato:", err);
            reject(err);
          }
          resolve(row);
        });
      });

      if (!candidato) {
        await db.run("ROLLBACK");
        return res.status(404).json({ erro: "Candidato não encontrado" });
      }

      // Verificar se o RA já está em uso por outro candidato
      if (ra !== candidato.ra) {
        const ra_existente = await new Promise((resolve, reject) => {
          db.get(
            "SELECT * FROM Candidato WHERE ra = ? AND id_candidato != ?",
            [ra, id_candidato],
            (err, row) => {
              if (err) {
                console.error("Erro ao verificar RA:", err);
                reject(err);
              }
              resolve(row);
            }
          );
        });

        if (ra_existente) {
          await db.run("ROLLBACK");
          return res.status(409).json({ 
            erro: "RA já cadastrado",
            detalhes: { ra }
          });
        }
      }

      // Verificar se o email já está em uso por outro usuário
      if (email_institucional !== candidato.email_institucional) {
        const email_existente = await new Promise((resolve, reject) => {
          db.get(
            "SELECT * FROM Usuario WHERE email_institucional = ? AND id_usuario != ?",
            [email_institucional, id_usuario],
            (err, row) => {
              if (err) {
                console.error("Erro ao verificar email:", err);
                reject(err);
              }
              resolve(row);
            }
          );
        });

        if (email_existente) {
          await db.run("ROLLBACK");
          return res.status(409).json({ 
            erro: "Email já cadastrado",
            detalhes: { email_institucional }
          });
        }
      }

      let foto_path = candidato.foto;
      if (files.foto) {
        console.log("Processando foto...");
        
        const arquivo = Array.isArray(files.foto) ? files.foto[0] : files.foto;
        
        if (!arquivo || !arquivo.mimetype || !arquivo.filepath) {
          console.log("Arquivo inválido:", arquivo);
          return res.status(400).json({ erro: "Arquivo inválido. Por favor, tente novamente." });
        }
        
        const tipos_permitidos = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!tipos_permitidos.includes(arquivo.mimetype)) {
          console.log("Tipo de arquivo não permitido:", arquivo.mimetype);
          if (arquivo.filepath && fsSync.existsSync(arquivo.filepath)) {
            await fs.unlink(arquivo.filepath);
          }
          return res.status(400).json({ erro: "Tipo de arquivo não permitido. Use apenas JPG, PNG, GIF ou WEBP." });
        }

        const tamanho_maximo = 5 * 1024 * 1024;
        if (arquivo.size > tamanho_maximo) {
          console.log("Arquivo muito grande:", arquivo.size);
          if (arquivo.filepath && fsSync.existsSync(arquivo.filepath)) {
            await fs.unlink(arquivo.filepath);
          }
          return res.status(400).json({ erro: "Arquivo muito grande. Tamanho máximo permitido: 5MB" });
        }

        // Excluir foto antiga se não for a padrão
        if (candidato.foto && !candidato.foto.includes("default-profile.jpg")) {
          const foto_antiga = path.join(process.cwd(), "public", candidato.foto);
          if (fsSync.existsSync(foto_antiga)) {
            await fs.unlink(foto_antiga);
            console.log("Foto antiga excluída:", foto_antiga);
          }
        }

        const nome_arquivo = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(arquivo.originalFilename)}`;
        
        const caminho_final = path.join(process.cwd(), "public/imgs/candidatos", nome_arquivo);
        await fs.rename(arquivo.filepath, caminho_final);
        
        foto_path = `/imgs/candidatos/${nome_arquivo}`;
        console.log("Foto processada com sucesso:", foto_path);
      }

      // Atualizar usuário
      const stmtUsuario = await db.prepare(`
        UPDATE Usuario SET
          nome = ?,
          email_institucional = ?,
          telefone = ?,
          foto = ?
          ${senha ? ", senha = ?" : ""}
        WHERE id_usuario = ?
      `);

      const paramsUsuario = [
        nome,
        email_institucional,
        telefone,
        foto_path
      ];

      if (senha) {
        console.log("Criptografando nova senha...");
        const senha_hash = await bcrypt.hash(senha, 10);
        paramsUsuario.push(senha_hash);
      }

      paramsUsuario.push(id_usuario);

      await stmtUsuario.run(...paramsUsuario);
      await stmtUsuario.finalize();

      // Atualizar candidato
      const stmtCandidato = await db.prepare(`
        UPDATE Candidato SET
          ra = ?,
          turma_atual = ?,
          deseja_ser_candidato = ?,
          descricao_campanha = ?
        WHERE id_candidato = ? AND id_usuario = ?
      `);

      await stmtCandidato.run(
        ra,
        turma_atual,
        deseja_ser_candidato === "true" ? 1 : 0,
        descricao_campanha || null,
        id_candidato,
        id_usuario
      );
      await stmtCandidato.finalize();

      // Commit da transação
      await db.run("COMMIT");

      return res.status(200).json({
        mensagem: "Candidato atualizado com sucesso!",
        dados: { id_candidato, nome, email: email_institucional }
      });

    } catch (error) {
      await db.run("ROLLBACK");
      throw error;
    }

  } catch (erro) {
    console.error("Erro ao atualizar candidato:", erro);
    
    if (db) {
      await db.close();
    }

    return res.status(500).json({ 
      erro: "Erro ao atualizar candidato",
      detalhes: process.env.NODE_ENV === "development" ? erro.message : undefined
    });
  } finally {
    if (db) {
      await db.close();
      console.log("Conexão com o banco fechada");
    }
  }
}
