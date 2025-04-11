import conectar_banco from '@/config/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    const Visitantes = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM Visitantes", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    return res.status(200).json({
      mensagem: 'Visitantes recuperados com sucesso',
      Visitantes: Visitantes
    });
  } catch (error) {
    console.error("Erro ao buscar Visitantes:", error);
    return res.status(500).json({ 
      erro: "Erro interno no servidor", 
      details: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  } finally {
    if (db) {
      await db.close();
      console.log('Conexão com o banco fechada');
    }
  }
} 