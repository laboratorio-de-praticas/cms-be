import conectar_banco from '@/config/database';
import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  try {
    // Verificar autenticação
    const auth = await authMiddleware(req, res);
    if (!auth.success) {
      return res.status(401).json({ mensagem: auth.mensagem });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ mensagem: 'ID do usuário é obrigatório' });
    }

    const db = await conectar_banco();

    // Buscar usuário
    const usuario = await db.get(`
      SELECT 
        u.id,
        u.nome,
        u.email_institucional,
        u.tipo_usuario,
        u.foto,
        u.data_criacao,
        c.ra,
        c.turma,
        c.curso,
        c.qr_code,
        c.deseja_ser_candidato
      FROM Usuario u
      LEFT JOIN Candidato c ON u.id = c.id_usuario
      WHERE u.id = ?
    `, [id]);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    await db.close();

    // Formatar resposta
    const resposta = {
      id: usuario.id,
      nome: usuario.nome,
      email_institucional: usuario.email_institucional,
      tipo_usuario: usuario.tipo_usuario,
      foto: usuario.foto,
      data_criacao: usuario.data_criacao,
      ...(usuario.tipo_usuario === 'aluno' && {
        ra: usuario.ra,
        turma: usuario.turma,
        curso: usuario.curso,
        qr_code: usuario.qr_code,
        deseja_ser_candidato: usuario.deseja_ser_candidato
      })
    };

    return res.status(200).json({
      mensagem: 'Usuário encontrado com sucesso',
      dados: resposta
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
} 