import { IncomingForm } from "formidable";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import sqlite3 from "sqlite3";

export const config = {
  api: {
    bodyParser: false,
  },
};

const conectar_banco = () => {
  try {
    const dbPath = path.join(
      process.cwd(),
      "src",
      "database",
      "cms_db.sqlite3"
    );
    const dbExists = fsSync.existsSync(dbPath);

    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Erro ao conectar/criar banco de dados:", err);
        throw err;
      }
      console.log(
        dbExists
          ? "Conectado ao banco de dados existente"
          : "Novo banco de dados criado"
      );
    });

    return db;
  } catch (erro) {
    console.error("Erro ao conectar ao banco de dados:", erro);
    throw erro;
  }
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

    const id = dadosJSON.id || "";
    const ra = dadosJSON.ra || "";
    const nome = dadosJSON.nome || "";
    const email_institucional = dadosJSON.email_institucional || "";
    const telefone = dadosJSON.telefone || "";
    const senha = dadosJSON.senha || "";
    const turma_atual = dadosJSON.turma_atual || "";
    const deseja_ser_candidato = dadosJSON.deseja_ser_candidato || "false";
    const link_video = dadosJSON.link_video || "";
    const descricao_campanha = dadosJSON.descricao_campanha || "";
    const curso = dadosJSON.curso || "";
    const semestre = dadosJSON.semestre || "";
    const ano_ingresso = dadosJSON.ano_ingresso || "";

    console.log("Campos recebidos:", fields);
    console.log("Arquivos recebidos:", files);

    if (
      !id ||
      !ra ||
      !nome ||
      !email_institucional ||
      !telefone ||
      !turma_atual ||
      !curso ||
      !semestre ||
      !ano_ingresso
    ) {
      console.log("Campos obrigatórios faltando:", {
        id: !id,
        ra: !ra,
        nome: !nome,
        email_institucional: !email_institucional,
        telefone: !telefone,
        turma_atual: !turma_atual,
        curso: !curso,
        semestre: !semestre,
        ano_ingresso: !ano_ingresso,
      });
      return res.status(400).json({
        erro: "Campos obrigatórios faltando",
        campos_faltando: {
          id: !id,
          ra: !ra,
          nome: !nome,
          email_institucional: !email_institucional,
          telefone: !telefone,
          turma_atual: !turma_atual,
          curso: !curso,
          semestre: !semestre,
          ano_ingresso: !ano_ingresso,
        },
      });
    }

    if (!email_institucional.endsWith("@fatec.sp.gov.br")) {
      console.log("Email institucional inválido:", email_institucional);
      return res.status(400).json({
        erro: "Email institucional inválido",
        mensagem: "O email deve terminar com @fatec.sp.gov.br",
        email_recebido: email_institucional,
        email_esperado: "seu.nome@fatec.sp.gov.br",
      });
    }

    console.log("Conectando ao banco de dados...");
    db = conectar_banco();
    console.log("Banco de dados conectado");

    console.log("Verificando se candidato existe...");
    const candidato_existente = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM Candidatos WHERE id = ?", [id], (err, row) => {
        if (err) {
          console.error("Erro ao verificar candidato:", err);
          reject(err);
        }
        resolve(row);
      });
    });

    if (!candidato_existente) {
      console.log("Candidato não encontrado:", id);
      return res.status(404).json({ erro: "Candidato não encontrado" });
    }

    // Verificar se é admin
    const isAdmin = email_institucional === "admin@fatec.sp.gov.br";
    console.log("Verificação de admin:", { isAdmin, email: email_institucional });

    // Se não for admin, verificar campos protegidos
    if (!isAdmin) {
      console.log("Valores originais:", {
        ra: candidato_existente.ra,
        email_institucional: candidato_existente.email_institucional,
        curso: candidato_existente.curso,
        ano_ingresso: candidato_existente.ano_ingresso
      });

      console.log("Valores recebidos:", {
        ra,
        email_institucional,
        curso,
        ano_ingresso
      });

      // Verificar se os campos protegidos foram alterados
      const campos_protegidos = {};
      
      if (String(ra) !== String(candidato_existente.ra)) {
        console.log("RA alterado:", { original: candidato_existente.ra, novo: ra });
        campos_protegidos.ra = true;
      }
      if (email_institucional !== candidato_existente.email_institucional) {
        console.log("Email alterado:", { original: candidato_existente.email_institucional, novo: email_institucional });
        campos_protegidos.email_institucional = true;
      }
      if (curso !== candidato_existente.curso) {
        console.log("Curso alterado:", { original: candidato_existente.curso, novo: curso });
        campos_protegidos.curso = true;
      }
      if (String(ano_ingresso) !== String(candidato_existente.ano_ingresso)) {
        console.log("Ano de ingresso alterado:", { original: candidato_existente.ano_ingresso, novo: ano_ingresso });
        campos_protegidos.ano_ingresso = true;
      }

      const campos_alterados = Object.keys(campos_protegidos);
      console.log("Campos alterados:", campos_alterados);

      if (campos_alterados.length > 0) {
        return res.status(403).json({
          erro: "Campos protegidos não podem ser alterados",
          campos_protegidos: campos_alterados,
        });
      }
    }

    console.log("Verificando conflitos de RA e email...");
    const conflito = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM Candidatos WHERE (ra = ? OR email_institucional = ?) AND id != ?",
        [ra, email_institucional, id],
        (err, row) => {
          if (err) {
            console.error("Erro ao verificar conflitos:", err);
            reject(err);
          }
          resolve(row);
        }
      );
    });

    if (conflito) {
      console.log("Conflito encontrado:", conflito);
      return res.status(409).json({
        erro: "Conflito de dados",
        conflito:
          conflito.ra === ra ? "RA já está em uso" : "Email já está em uso",
      });
    }

    let foto_path = candidato_existente.foto || "/imgs/default-profile.jpg";
    if (files.foto) {
      console.log("Processando nova foto...");

      const arquivo = Array.isArray(files.foto) ? files.foto[0] : files.foto;

      if (!arquivo || !arquivo.mimetype || !arquivo.filepath) {
        console.log("Arquivo inválido:", arquivo);
        return res
          .status(400)
          .json({ erro: "Arquivo inválido. Por favor, tente novamente." });
      }

      const tipos_permitidos = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!tipos_permitidos.includes(arquivo.mimetype)) {
        console.log("Tipo de arquivo não permitido:", arquivo.mimetype);
        if (arquivo.filepath && fsSync.existsSync(arquivo.filepath)) {
          await fs.unlink(arquivo.filepath);
        }
        return res.status(400).json({
          erro: "Tipo de arquivo não permitido. Use apenas JPG, PNG, GIF ou WEBP.",
        });
      }

      const tamanho_maximo = 5 * 1024 * 1024;
      if (arquivo.size > tamanho_maximo) {
        console.log("Arquivo muito grande:", arquivo.size);
        if (arquivo.filepath && fsSync.existsSync(arquivo.filepath)) {
          await fs.unlink(arquivo.filepath);
        }
        return res.status(400).json({
          erro: "Arquivo muito grande. Tamanho máximo permitido: 5MB",
        });
      }

      const nome_arquivo = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(arquivo.originalFilename)}`;

      const caminho_final = path.join(
        process.cwd(),
        "public/imgs/candidatos",
        nome_arquivo
      );
      await fs.rename(arquivo.filepath, caminho_final);

      foto_path = `/imgs/candidatos/${nome_arquivo}`;
      console.log("Nova foto processada com sucesso:", foto_path);

      if (
        candidato_existente.foto &&
        !candidato_existente.foto.includes("default-profile.jpg")
      ) {
        const foto_antiga = path.join(
          process.cwd(),
          "public",
          candidato_existente.foto
        );
        if (fsSync.existsSync(foto_antiga)) {
          await fs.unlink(foto_antiga);
          console.log("Foto antiga excluída:", foto_antiga);
        }
      }
    }

    console.log("Verificando estrutura da tabela Candidatos...");
    await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Candidatos'", (err, row) => {
        if (err) {
          console.error('Erro ao verificar tabela:', err);
          reject(err);
        }
        if (!row) {
          console.log('Tabela Candidatos não existe, criando...');
          db.run(`
            CREATE TABLE IF NOT EXISTS Candidatos (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              ra TEXT UNIQUE NOT NULL,
              email_institucional TEXT UNIQUE NOT NULL,
              telefone TEXT NOT NULL,
              senha TEXT NOT NULL,
              nome TEXT NOT NULL,
              turma_atual TEXT NOT NULL,
              foto TEXT,
              deseja_ser_candidato INTEGER DEFAULT 0,
              link_video TEXT,
              descricao_campanha TEXT,
              curso TEXT NOT NULL,
              semestre TEXT NOT NULL,
              ano_ingresso TEXT NOT NULL,
              status_candidatura TEXT,
              qr_code TEXT
            )
          `, (err) => {
            if (err) {
              console.error('Erro ao criar tabela:', err);
              reject(err);
            }
            console.log('Tabela Candidatos criada com sucesso');
            resolve();
          });
        } else {
          console.log('Tabela Candidatos já existe');
          resolve();
        }
      });
    });

    let sql = `
  UPDATE Candidatos SET
    telefone = ?,
    nome = ?,
    turma_atual = ?,
    foto = ?,
    deseja_ser_candidato = ?,
    link_video = ?,
    descricao_campanha = ?,
    semestre = ?
`;

    let params = [
      telefone,
      nome,
      turma_atual,
      foto_path,
      deseja_ser_candidato === "true" ? 1 : 0,
      link_video || null,
      descricao_campanha || null,
      semestre,
    ];

    // Se for admin, incluir campos protegidos
    if (isAdmin) {
      sql = `
        UPDATE Candidatos SET
          ra = ?,
          email_institucional = ?,
          telefone = ?,
          nome = ?,
          turma_atual = ?,
          foto = ?,
          deseja_ser_candidato = ?,
          link_video = ?,
          descricao_campanha = ?,
          curso = ?,
          semestre = ?,
          ano_ingresso = ?
      `;

      params = [
        ra,
        email_institucional,
        telefone,
        nome,
        turma_atual,
        foto_path,
        deseja_ser_candidato === "true" ? 1 : 0,
        link_video || null,
        descricao_campanha || null,
        curso,
        semestre,
        ano_ingresso
      ];
    }

    if (senha) {
      console.log('Criptografando nova senha...');
      const senha_hash = await bcrypt.hash(senha, 10);
      sql += ', senha = ?';
      params.push(senha_hash);
    }
    
    sql += ' WHERE id = ?';
    params.push(id);

    console.log("Atualizando candidato no banco...");
    await new Promise((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) {
          console.error("Erro ao atualizar candidato:", err);
          reject(err);
        }
        console.log("Candidato atualizado com sucesso");
        resolve();
      });
    });

    // Buscar dados atualizados do candidato
    const candidato_atualizado = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM Candidatos WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            console.error("Erro ao buscar candidato atualizado:", err);
            reject(err);
          }
          resolve(row);
        }
      );
    });

    db.close();
    console.log("Conexão com o banco fechada");

    return res.status(200).json({
      mensagem: "Candidato atualizado com sucesso!",
      dados: {
        id: candidato_atualizado.id,
        ra: candidato_atualizado.ra,
        nome: candidato_atualizado.nome,
        email_institucional: candidato_atualizado.email_institucional,
        telefone: candidato_atualizado.telefone,
        turma_atual: candidato_atualizado.turma_atual,
        foto: candidato_atualizado.foto,
        deseja_ser_candidato: Boolean(candidato_atualizado.deseja_ser_candidato),
        link_video: candidato_atualizado.link_video,
        descricao_campanha: candidato_atualizado.descricao_campanha,
        curso: candidato_atualizado.curso,
        semestre: candidato_atualizado.semestre,
        ano_ingresso: candidato_atualizado.ano_ingresso,
        status_candidatura: candidato_atualizado.status_candidatura,
        qr_code: candidato_atualizado.status_candidatura === 'aprovado' ? candidato_atualizado.qr_code : null
      }
    });
  } catch (erro) {
    console.error("Erro ao atualizar candidato:", erro);

    if (db) {
      db.close();
    }

    return res.status(500).json({
      erro: "Erro ao atualizar candidato",
      detalhes:
        process.env.NODE_ENV === "development" ? erro.message : undefined,
    });
  }
}
