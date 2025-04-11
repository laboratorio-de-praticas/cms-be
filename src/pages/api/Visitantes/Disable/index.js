import conectar_banco from '@/config/database';

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
    db = await conectar_banco();
    console.log('Banco de dados conectado');

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

    if (!Visitante.Status) {
      return res.status(400).json({ erro: 'Visitante já está desativado' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE Visitantes SET Status = false WHERE id = ?',
        [id],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    return res.status(200).json({ 
      mensagem: 'Visitante desativado com sucesso',
      projeto_id: id 
    });
  } catch (erro) {
    console.error('Erro ao desativar Visitante:', erro);
    return res.status(500).json({ erro: 'Erro ao desativar Visitante' });
  } finally {
    if (db) {
      await db.close();
      console.log('Conexão com o banco fechada');
    }
  }
}