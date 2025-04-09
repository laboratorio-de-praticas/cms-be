import conectar_banco from '@/config/database';
import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  try {
    // Verificar autenticação
    const auth = await authMiddleware(req, res);
    if (!auth.success) {
      return res.status(401).json({ mensagem: auth.mensagem });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ mensagem: 'ID do projeto é obrigatório' });
    }

    const db = await conectar_banco();

    // Verifica se o projeto existe
    const projeto = await db.get('SELECT id, ativo FROM Projetos WHERE id = ?', [id]);

    if (!projeto) {
      return res.status(404).json({ mensagem: 'Projeto não encontrado' });
    }

    if (!projeto.ativo) {
      return res.status(400).json({ mensagem: 'Projeto já está desativado' });
    }

    // Desativa o projeto
    await db.run('UPDATE Projetos SET ativo = 0 WHERE id = ?', [id]);

    await db.close();

    return res.status(200).json({ 
      mensagem: 'Projeto desativado com sucesso',
      dados: {
        id,
        ativo: false
      }
    });

  } catch (erro) {
    console.error('Erro ao desativar projeto:', erro);
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
} 