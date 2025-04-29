// lib/multerConfig.js
import multer from 'multer';
import nextConnect from 'next-connect';
import path from 'path';
import fs from 'fs';

// Garante que a pasta exista
const pastaUploads = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pastaUploads); // destino dos arquivos
  },
  filename: function (req, file, cb) {
    const nomeUnico = `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;
    cb(null, nomeUnico); // nome único para evitar conflitos
  },
});

const upload = multer({ storage: storage });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(500).json({ mensagem: 'Erro no upload da imagem', detalhes: error.toString() });
  },
  onNoMatch(req, res) {
    res.status(405).json({ mensagem: `Método ${req.method} não permitido` });
  },
});

// Processa o upload
apiRoute.use(upload.single('imagem'));

apiRoute.post((req, res) => {
  const caminhoRelativo = `/uploads/${req.file.filename}`; // caminho relativo para o banco de dados
  res.status(200).json({
    mensagem: 'Upload realizado com sucesso',
    foto_url: caminhoRelativo, // resposta com o caminho da foto
  });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Necessário para o multer
  },
};
