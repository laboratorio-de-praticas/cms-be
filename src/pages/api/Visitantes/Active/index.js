import sqlite3 from "sqlite3"
import path from "path"

const conectar_banco = () => {
    const dbPath = path.join(process.cwd(), "src", "database", "cms_db.sqlite3");
    return new sqlite3.Database(dbPath);
  };

  export default async function handler(req, res) {
    
      if (req.method !== 'PUT') {
        return res.status(405).json({ erro: 'Método não permitido' });
      }
  
      const { id } = req.body;
  
      if (!id) {
        return res.status(400).json({ erro: 'ID do visitante é obrigatório' });
      }
  
      let db;
      try {
        db = conectar_banco();
  
        
        const Visitante = await new Promise((resolve, reject) => {
          db.get(
            'SELECT id, Status FROM Visitantes WHERE id = ?',
            [id],
            (err, row) => {
              if (err) reject(err);
              resolve(row);
            }
          );
        });
  
        if (!Visitante) {
          return res.status(404).json({ erro: 'Visitante não encontrado' });
        }
  
        if (Visitante.Status) {
          return res.status(400).json({ erro: 'Visitante já está Ativado' });
        }
 
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE Visitantes SET Status = True WHERE id = ?',
            [id],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
  
        db.close();
  
        return res.status(200).json({ 
          mensagem: 'Visitante ativado com sucesso',
          projeto_id: id 
        });
  
      } catch (erro) {
        console.error('Erro ao ativar Visitante:', erro);
        
        if (db) {
          db.close();
        }
  
        return res.status(500).json({ erro: 'Erro ao ativar Visitante' });
      }
    ;
  }