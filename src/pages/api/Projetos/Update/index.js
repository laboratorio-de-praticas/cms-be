import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import conectar_banco from '@/config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  let db;
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ mensagem: auth.mensagem });
    // }

    const form = new IncomingForm();
    // ... existing code ...
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    return res.status(500).json({ mensagem: 'Erro ao processar a requisição' });
  }
} 