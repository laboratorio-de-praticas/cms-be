const conectar_banco = require('@/config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {

    await processarUpload(req, res);

    const { id } = req.query;
    const dados = JSON.parse(req.body.dados);
    const {
      nome_Projeto,
      nome_equipe,
      tlr,
      turma,
      descricao,
      cea,
      area_atuacao,
      ods,
      linhas_extensao,
      areas_tematicas,
      integrantes
    } = dados;

    // Verifica se foram enviadas novas imagens
    const imagem_capa = req.files['imagem_capa'] ? 
      req.files['imagem_capa'][0].filename : 
      dados.imagem_capa;

    const novas_imagens_projeto = req.files['imagens_projeto'] ? 
      req.files['imagens_projeto'].map(file => file.filename) : 
      [];

    const imagens_projeto = [
      ...(dados.imagens_projeto || []),
      ...novas_imagens_projeto
    ];

    let db;
    try {
      db = conectar_banco();

      // Inicia a transação
      await new Promise((resolve, reject) => {
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // 1. Atualiza a tabela principal de Projetos
      await new Promise((resolve, reject) => {
        const sql = `
          UPDATE Projetos 
          SET 
            nome_Projeto = ?,
            nome_equipe = ?,
            tlr = ?,
            imagem_capa = ?,
            turma = ?,
            descricao = ?,
            cea = ?,
            area_atuacao = ?
          WHERE id = ?
        `;

        db.run(sql, [
          nome_Projeto,
          nome_equipe,
          tlr,
          imagem_capa,
          turma,
          descricao,
          cea,
          area_atuacao,
          id
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // 2. Atualiza ODS
      if (ods && ods.length > 0) {
        await new Promise((resolve, reject) => {
          db.run('DELETE FROM ProjetoODS WHERE projeto_id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        for (const ods_id of ods) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO ProjetoODS (projeto_id, ods_id) VALUES (?, ?)',
              [id, ods_id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

      // 3. Atualiza Linhas de Extensão
      if (linhas_extensao && linhas_extensao.length > 0) {
        await new Promise((resolve, reject) => {
          db.run('DELETE FROM ProjetoLinhaExtensao WHERE projeto_id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        for (const linha_id of linhas_extensao) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO ProjetoLinhaExtensao (projeto_id, linha_extensao_id) VALUES (?, ?)',
              [id, linha_id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

      // 4. Atualiza Áreas Temáticas
      if (areas_tematicas && areas_tematicas.length > 0) {
        await new Promise((resolve, reject) => {
          db.run('DELETE FROM ProjetoAreaTematica WHERE projeto_id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        for (const area_id of areas_tematicas) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO ProjetoAreaTematica (projeto_id, area_tematica_id) VALUES (?, ?)',
              [id, area_id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

      // 5. Atualiza Integrantes
      if (integrantes && integrantes.length > 0) {
        await new Promise((resolve, reject) => {
          db.run('DELETE FROM IntegrantesEquipe WHERE projeto_id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        for (const nome_integrante of integrantes) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO IntegrantesEquipe (projeto_id, nome_integrante) VALUES (?, ?)',
              [id, nome_integrante],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

      // 6. Atualiza Imagens do Projeto
      if (imagens_projeto && imagens_projeto.length > 0) {
        // Busca imagens antigas para possível remoção
        const imagens_antigas = await new Promise((resolve, reject) => {
          db.all('SELECT imagem_url FROM ImagensProjeto WHERE projeto_id = ?', [id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(row => row.imagem_url));
          });
        });

        // Remove imagens antigas que não estão mais na lista
        const imagens_removidas = imagens_antigas.filter(img => !imagens_projeto.includes(img));
        for (const img of imagens_removidas) {
          const caminho = path.join('./public/uploads/', img);
          if (fs.existsSync(caminho)) {
            fs.unlinkSync(caminho);
          }
        }

        // Atualiza registros no banco
        await new Promise((resolve, reject) => {
          db.run('DELETE FROM ImagensProjeto WHERE projeto_id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        for (const imagem_url of imagens_projeto) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO ImagensProjeto (projeto_id, imagem_url) VALUES (?, ?)',
              [id, imagem_url],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

      // Commit da transação
      await new Promise((resolve, reject) => {
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      db.close();

      return res.status(200).json({
        mensagem: 'Projeto atualizado com sucesso',
        projeto_id: id
      });

    } catch (erro) {
      console.error('Erro ao atualizar projeto:', erro);
      
      // Rollback em caso de erro
      if (db) {
        await new Promise((resolve) => {
          db.run('ROLLBACK', () => resolve());
        });
        db.close();
      }

      // Remove arquivos enviados em caso de erro
      if (req.files) {
        if (req.files['imagem_capa']) {
          fs.unlinkSync(path.join('./public/projetos/capas', req.files['imagem_capa'][0].filename));
        }
        if (req.files['imagens_projeto']) {
          req.files['imagens_projeto'].forEach(file => {
            fs.unlinkSync(path.join('./public/projetos/Imagens_Projeto', file.filename));
          });
        }
      }

      return res.status(500).json({ erro: 'Erro ao atualizar projeto' });
    }

  } catch (erro) {
    console.error('Erro ao processar upload:', erro);
    return res.status(500).json({ erro: 'Erro ao processar upload de arquivos' });
  }
}