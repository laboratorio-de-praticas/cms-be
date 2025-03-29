const conectar_banco = require('@/config/database');

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ erro: 'ID do projeto é obrigatório' });
  }

  let db;
  try {
    db = conectar_banco();

    // Verifica se o projeto existe
    const projeto = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, Ativo FROM Projetos WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    if (!projeto.Ativo) {
      return res.status(400).json({ erro: 'Projeto já está desativado' });
    }

    // Desativa o projeto
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE Projetos SET Ativo = false WHERE id = ?',
        [id],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    db.close();

    return res.status(200).json({ 
      mensagem: 'Projeto desativado com sucesso',
      projeto_id: id 
    });

  } catch (erro) {
    console.error('Erro ao desativar projeto:', erro);
    
    if (db) {
      db.close();
    }

    return res.status(500).json({ erro: 'Erro ao desativar projeto' });
  }
} 