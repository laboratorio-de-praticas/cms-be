import conectar_banco from '@/config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  let db;
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ mensagem: auth.mensagem });
    // }

    const { id_evento, id_candidato } = req.body;

    // Validação dos campos obrigatórios
    if (!id_evento || !id_candidato) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios faltando',
        campos_faltando: {
          id_evento: !id_evento,
          id_candidato: !id_candidato
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

    // Verificar se o candidato existe
    const candidato = await db.get(
      'SELECT * FROM Candidatos WHERE id = ?',
      [id_candidato]
    );

    if (!candidato) {
      return res.status(404).json({ 
        erro: 'Candidato não encontrado' 
      });
    }

    // Verificar se o candidato já está inscrito no evento
    const inscricao = await db.get(
      'SELECT * FROM EventoCandidato WHERE id_evento = ? AND id_candidato = ?',
      [id_evento, id_candidato]
    );

    if (inscricao) {
      return res.status(400).json({ 
        erro: 'Candidato já está inscrito neste evento' 
      });
    }

    // Gerar URL de confirmação
    const url_confirmacao = `${process.env.NEXT_PUBLIC_API_URL}/votacao/interna/confirmacao/${id_evento}/${id_candidato}`;

    // Inserir relação evento-candidato
    const stmt = await db.prepare(`
      INSERT INTO EventoCandidato (
        id_evento, id_candidato, url_confirmacao
      ) VALUES (?, ?, ?)
    `);

    try {
      await stmt.run(id_evento, id_candidato, url_confirmacao);
      await stmt.finalize();

      return res.status(201).json({
        mensagem: 'Candidato adicionado ao evento com sucesso',
        dados: {
          id_evento,
          id_candidato,
          url_confirmacao
        }
      });

    } catch (error) {
      console.error('Erro ao adicionar candidato ao evento:', error);
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