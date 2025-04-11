import conectar_banco from '@/config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  let db;
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ mensagem: auth.mensagem });
    // }

    const { id_candidato } = req.query;
    console.log('ID do candidato recebido:', id_candidato);

    if (!id_candidato) {
      return res.status(400).json({ erro: 'ID do candidato é obrigatório' });
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Iniciar transação
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      // Buscar dados do candidato para excluir a foto
      const candidato = await new Promise((resolve, reject) => {
        db.get(`
          SELECT u.foto
          FROM Candidato c
          JOIN Usuario u ON c.id_usuario = u.id_usuario
          WHERE c.id_candidato = ?
        `, [id_candidato], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!candidato) {
        throw new Error('Candidato não encontrado');
      }

      // Excluir registros relacionados
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM EventoxCandidato WHERE id_candidato = ?', [id_candidato], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Excluir o candidato
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM Candidato WHERE id_candidato = ?', [id_candidato], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Excluir o usuário
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM Usuario WHERE id_usuario = (SELECT id_usuario FROM Candidato WHERE id_candidato = ?)', [id_candidato], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Commit da transação
      await new Promise((resolve, reject) => {
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Excluir a foto do candidato se existir
      if (candidato.foto) {
        const fotoPath = path.join(process.cwd(), 'public', 'uploads', 'candidatos', candidato.foto);
        if (fs.existsSync(fotoPath)) {
          await fs.unlink(fotoPath);
        }
      }

      return res.status(200).json({ mensagem: 'Candidato excluído com sucesso' });

    } catch (error) {
      // Rollback em caso de erro
      await new Promise((resolve) => {
        db.run('ROLLBACK', () => resolve());
      });
      throw error;
    }

  } catch (error) {
    console.error('Erro ao excluir candidato:', error);
    return res.status(500).json({ 
      erro: 'Erro interno do servidor',
      detalhes: error.message 
    });
  } finally {
    if (db) {
      await db.close();
      console.log('Conexão com o banco fechada');
    }
  }
} 