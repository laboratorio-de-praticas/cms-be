

import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const conectar_banco = () => {
  const dbPath = path.join(process.cwd(), "src", "database", "cms_db.sqlite3");
  return new sqlite3.Database(dbPath);
};

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { id, nome, telefone, cidade, senha } = req.body;

  if (!id || !nome || !telefone || !cidade) {
    return res.status(400).json({
      erro: "Campos obrigatórios faltando",
      campos_faltando: {
        id: !id,
        nome: !nome,
        telefone: !telefone,
        cidade: !cidade,
      },
    });
  }

  const db = conectar_banco();

  try {

    const visitanteExistente = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM Visitantes WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!visitanteExistente) {
      db.close();
      return res.status(404).json({ erro: "Visitante não encontrado" });
    }


    let sql = `
      UPDATE Visitantes SET
        nome = ?,
        telefone = ?,
        cidade = ?
    `;
    const params = [nome, telefone, cidade];

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      sql += `, senha = ?`;
      params.push(senhaHash);
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    await new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve();
      });
    });

    db.close();
    return res.status(200).json({ mensagem: "Visitante atualizado com sucesso!" });

  } catch (erro) {
    db.close();
    console.error("Erro ao atualizar visitante:", erro);
    return res.status(500).json({ erro: "Erro ao atualizar visitante" });
  }
}