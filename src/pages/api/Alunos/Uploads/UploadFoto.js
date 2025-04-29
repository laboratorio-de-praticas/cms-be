import multer from 'multer';
import path from 'path';

// Configura o Multer
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, ''));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if ((ext === '.jpg' || ext === '.jpeg' || ext === '.png') &&
        (mime === 'image/jpeg' || mime === 'image/png')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos JPEG ou PNG são permitidos.'));
    }
  },
});

// Middleware adaptado para async
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// Handler principal
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, upload.single('imagem'));
      
      if (!req.file) {
        return res.status(400).json({ mensagem: 'Nenhum arquivo enviado.' });
      }

      return res.status(200).json({ foto_url: `/uploads/${req.file.filename}` });
    } catch (error) {
      console.error('Erro no upload:', error);
      return res.status(500).json({ mensagem: 'Erro no upload da imagem', detalhes: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ mensagem: `Método ${req.method} não permitido.` });
  }
}

// 👇 IMPORTANTE: Desativa o bodyParser para permitir FormData (upload de arquivos)
export const config = {
  api: {
    bodyParser: false,
  },
};
