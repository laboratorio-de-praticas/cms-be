import { conectar_banco } from '../../../../config/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ mensagem: 'ID do usuário não fornecido' });
  }

  // Valida se o ID é um número válido
  if (isNaN(Number(id))) {
    return res.status(400).json({ mensagem: 'ID do usuário inválido' });
  }

  const client = await conectar_banco();

  try {
    // Busca os dados básicos do usuário
    const queryUsuario = `
      SELECT 
        id,
        nome,
        email_institucional,
        tipo_usuario,
        status_usuario,
        telefone,
        data_criacao
      FROM "Usuarios"
      WHERE id = $1
    `;

    const resultUsuario = await client.query(queryUsuario, [id]);

    if (resultUsuario.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    const usuario = resultUsuario.rows[0];

    // Se for um aluno, busca os dados específicos
    if (usuario.tipo_usuario === 'Interno') {
      const queryAluno = `
        SELECT 
          id_aluno,
          ra,
          curso_semestre,
          deseja_ser_candidato
        FROM "Alunos"
        WHERE fk_id_usuario = $1
      `;

      const resultAluno = await client.query(queryAluno, [id]);
      
      if (resultAluno.rows.length > 0) {
        usuario.dados_aluno = resultAluno.rows[0];
      }
    }

    // Remove campos sensíveis antes de retornar
    delete usuario.senha;

    return res.status(200).json({
      mensagem: 'Usuário encontrado com sucesso',
      dados: usuario
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({
      mensagem: 'Erro ao buscar usuário',
      detalhes: error.message
    });
  } finally {
    client.release();
  }
} 