import { conectar_banco } from '@/config/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const client = await conectar_banco();

  try {
    const query = `
      SELECT 
        u.id,
        u.nome,
        u.email_institucional,
        u.tipo_usuario,
        u.status_usuario,
        u.telefone,
        u.data_criacao,
        a.id_aluno,
        a.ra,
        a.curso_semestre,
        a.deseja_ser_candidato
      FROM "Usuarios" u
      LEFT JOIN "Alunos" a ON u.id = a.fk_id_usuario
      ORDER BY u.nome ASC
    `;

    const result = await client.query(query);
    const usuarios = result.rows.map(usuario => {
      const dadosUsuario = {
        id: usuario.id,
        nome: usuario.nome,
        email_institucional: usuario.email_institucional,
        tipo_usuario: usuario.tipo_usuario,
        status_usuario: usuario.status_usuario,
        telefone: usuario.telefone,
        data_criacao: usuario.data_criacao
      };

      // Se for um aluno, adiciona os dados específicos
      if (usuario.tipo_usuario === 'Interno' && usuario.id_aluno) {
        dadosUsuario.dados_aluno = {
          id_aluno: usuario.id_aluno,
          ra: usuario.ra,
          curso_semestre: usuario.curso_semestre,
          deseja_ser_candidato: usuario.deseja_ser_candidato
        };
      }

      return dadosUsuario;
    });

    return res.status(200).json({
      mensagem: 'Usuários listados com sucesso',
      total: usuarios.length,
      dados: usuarios
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({
      mensagem: 'Erro ao listar usuários',
      detalhes: error.message
    });
  } finally {
    client.release();
  }
} 