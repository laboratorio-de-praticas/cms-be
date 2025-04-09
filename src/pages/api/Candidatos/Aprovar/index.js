import conectar_banco from '@/config/database';
import authMiddleware from '@/middleware/authMiddleware';
import { generateQRCode } from '@/utils/qrCodeGenerator';
import { promises as fs } from 'fs';
import path from 'path';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    const { id_usuario } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ erro: 'ID do usuário é obrigatório' });
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Verificar se o usuário existe e é um candidato
    const usuario = await db.get(
      'SELECT * FROM Usuario WHERE id_usuario = ?',
      [id_usuario]
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    if (usuario.tipo_usuario !== 'aluno') {
      return res.status(400).json({ erro: 'Apenas alunos podem ser candidatos' });
    }

    // Atualizar status do candidato
    await db.run(
      'UPDATE Candidato SET deseja_ser_candidato = 1 WHERE id_usuario = ?',
      [id_usuario]
    );

    // Gerar QR Code com URL específica para votação interna
    const host = req.headers.host || 'localhost:3000';
    const qrCodeData = `http://${host}/votacao/interna/confirmacao/1/${id_usuario}`;
    const qrCodePath = path.join(process.cwd(), 'public', 'imgs', 'candidatos', 'qrcodes', `${id_usuario}.png`);
    
    // Garantir que o diretório existe
    await fs.mkdir(path.dirname(qrCodePath), { recursive: true });
    
    await generateQRCode(qrCodeData, qrCodePath);
    const qrCodeUrl = `/imgs/candidatos/qrcodes/${id_usuario}.png`;

    // Atualizar candidato com URL do QR Code
    await db.run(
      'UPDATE Candidato SET qr_code = ? WHERE id_usuario = ?',
      [qrCodeUrl, id_usuario]
    );

    return res.status(200).json({
      mensagem: 'Candidato aprovado com sucesso',
      id_usuario,
      qr_code: qrCodeUrl
    });

  } catch (error) {
    console.error('Erro ao aprovar candidato:', error);
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