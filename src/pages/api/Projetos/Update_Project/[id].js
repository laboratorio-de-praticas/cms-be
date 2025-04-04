const conectar_banco = require('@/config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
import { requireAuth, canEditProject } from '../../../middleware/authMiddleware';

// Configuração do Multer
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // Define o destino baseado no campo do arquivo
      const pasta = file.fieldname === 'imagem_capa' ? 
        './public/imgs/projetos/capas' : 
        './public/imgs/projetos/Imagens_Projeto';
      
      // Cria o diretório se não existir
      if (!fs.existsSync(pasta)){
        fs.mkdirSync(pasta, { recursive: true });
      }
      
      cb(null, pasta);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Buffer.from(file.originalname).toString('hex');
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })
});

// Função para processar o upload
const processarUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    upload.fields([
      { name: 'imagem_capa', maxCount: 1 },
      { name: 'imagens_projeto', maxCount: 10 }
    ])(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Aplicar middlewares
    await requireAuth(req, res, async () => {
      await canEditProject(req, res, async () => {
        const { id } = req.query;
        const { titulo, descricao } = req.body;

        const result = await pool.query(
          'UPDATE Projetos SET titulo = $1, descricao = $2, data_alteracao = CURRENT_TIMESTAMP WHERE id_projeto = $3 RETURNING *',
          [titulo, descricao, id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        res.status(200).json(result.rows[0]);
      });
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}