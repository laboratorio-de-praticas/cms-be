import conectar_banco from '@/config/database';
import authMiddleware from '@/middleware/authMiddleware';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    const { id_evento, id_projeto } = req.body;

    // Validação dos campos obrigatórios
    if (!id_evento || !id_projeto) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios faltando',
        campos_faltando: {
          id_evento: !id_evento,
          id_projeto: !id_projeto
        }
      });
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Verificar se o evento existe
    const evento = await db.get(
      'SELECT * FROM Eventos WHERE id_evento = ?',
      [id_evento]
    );

    if (!evento) {
      return res.status(404).json({ 
        erro: 'Evento não encontrado' 
      });
    }

    // Verificar se o projeto existe
    const projeto = await db.get(
      'SELECT * FROM Projetos WHERE id_projeto = ?',
      [id_projeto]
    );

    if (!projeto) {
      return res.status(404).json({ 
        erro: 'Projeto não encontrado' 
      });
    }

    // Verificar se o projeto já está inscrito no evento
    const inscricao = await db.get(
      'SELECT * FROM EventoProjeto WHERE id_evento = ? AND id_projeto = ?',
      [id_evento, id_projeto]
    );

    if (inscricao) {
      return res.status(400).json({ 
        erro: 'Projeto já está inscrito neste evento' 
      });
    }

    // Gerar URL de confirmação
    const url_confirmacao = `${process.env.NEXT_PUBLIC_API_URL}/votacao/externa/confirmacao/${id_evento}/${id_projeto}`;

    // Inserir relação evento-projeto
    const stmt = await db.prepare(`
      INSERT INTO EventoProjeto (
        id_evento, id_projeto, url_confirmacao
      ) VALUES (?, ?, ?)
    `);

    try {
      await stmt.run(id_evento, id_projeto, url_confirmacao);
      await stmt.finalize();

      return res.status(201).json({
        mensagem: 'Projeto adicionado ao evento com sucesso',
        dados: {
          id_evento,
          id_projeto,
          url_confirmacao
        }
      });

    } catch (error) {
      console.error('Erro ao adicionar projeto ao evento:', error);
      throw error;
    }

  } catch (error) {
    console.error('Erro ao processar requisição:', error);
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

export default authMiddleware(handler); 