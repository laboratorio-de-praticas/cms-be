import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key'; // Use uma chave secreta segura

export default function authMiddleware(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // O token deve ser passado no cabeçalho Authorization

      if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido' });
      }

      jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(401).json({ erro: 'Token inválido' });
        }
        req.user = decoded; // Salva as informações do usuário decodificadas na requisição
        return handler(req, res);
      });
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  };
} 