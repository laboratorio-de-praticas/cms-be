const { pool } = require('../config/database');

// Função auxiliar para verificar se o usuário é admin
async function isAdmin(userId) {
  try {
    const result = await pool.query(
      'SELECT tipo_usuario FROM Usuarios WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.tipo_usuario === 'Admin';
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return false;
  }
}

// Middleware para verificar autenticação
const requireAuth = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    req.userId = userId;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar se é admin
const requireAdmin = async (req, res, next) => {
  try {
    const isUserAdmin = await isAdmin(req.userId);
    if (!isUserAdmin) {
      return res.status(403).json({ error: 'Acesso negado - Apenas administradores' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar permissão de edição de perfil
const canEditProfile = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId || req.body.userId;
    const isUserAdmin = await isAdmin(req.userId);

    // Admin pode editar qualquer perfil
    if (isUserAdmin) {
      return next();
    }

    // Usuário só pode editar seu próprio perfil
    if (req.userId !== targetUserId) {
      return res.status(403).json({ error: 'Acesso negado - Você só pode editar seu próprio perfil' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar permissão de edição de projeto
const canEditProject = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const isUserAdmin = await isAdmin(req.userId);

    // Admin pode editar qualquer projeto
    if (isUserAdmin) {
      return next();
    }

    // Verificar se o usuário é o dono do projeto
    const result = await pool.query(
      'SELECT fk_id_usuario FROM Projetos WHERE id_projeto = $1',
      [projectId]
    );

    if (result.rows[0]?.fk_id_usuario !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado - Você só pode editar seus próprios projetos' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar permissão de voto
const canVote = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    // Verificar se o usuário está ativo
    const result = await pool.query(
      'SELECT status_usuario FROM Usuarios WHERE id = $1',
      [userId]
    );

    if (result.rows[0]?.status_usuario !== 'Ativo') {
      return res.status(403).json({ error: 'Acesso negado - Usuário não está ativo' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  canEditProfile,
  canEditProject,
  canVote
}; 