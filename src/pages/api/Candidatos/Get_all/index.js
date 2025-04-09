const conectar_banco = require('@/config/database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    db = conectar_banco();

    const candidatos = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM Candidatos',
        (err, rows) => {
          if (err) {
            console.error("Erro ao buscar candidatos:", err);
            reject(err);
          }
          resolve(rows);
        }
      );
    });

    db.close();
    console.log("Conexão com o banco fechada");

    return res.status(200).json({
      mensagem: "Candidatos encontrados com sucesso!",
      dados: candidatos.map(candidato => ({
        id: candidato.id,
        ra: candidato.ra,
        nome: candidato.nome,
        email_institucional: candidato.email_institucional,
        telefone: candidato.telefone,
        turma_atual: candidato.turma_atual,
        foto: candidato.foto,
        deseja_ser_candidato: Boolean(candidato.deseja_ser_candidato),
        link_video: candidato.link_video,
        descricao_campanha: candidato.descricao_campanha,
        curso: candidato.curso,
        semestre: candidato.semestre,
        ano_ingresso: candidato.ano_ingresso,
        status_candidatura: candidato.status_candidatura,
        qr_code: candidato.status_candidatura === 'aprovado' ? candidato.qr_code : null
      }))
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