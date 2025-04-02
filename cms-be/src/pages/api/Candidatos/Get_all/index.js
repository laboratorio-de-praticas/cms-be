const conectar_banco = require('@/config/database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    db = conectar_banco();

    const candidatos = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM Candidatos", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    db.close();

    return res.status(200).json({
      mensagem: 'Candidatos recuperados com sucesso',
      candidatos: candidatos
    });
  } catch (error) {
    console.error("Erro ao buscar candidatos:", error);
    
    if (db) {
      db.close();
    }

    return res.status(500).json({ 
      erro: "Erro interno no servidor", 
      details: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
} 