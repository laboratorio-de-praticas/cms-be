import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Configuração para permitir o parsing do form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

const conectar_banco = require('@/config/database');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    // Criar diretório se não existir
    await fs.mkdir(path.join(process.cwd(), 'public/imgs/projetos'), { recursive: true });

    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'public/imgs/projetos'),
      keepExtensions: true,
    });

    // Parse do form-data
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Conectar ao banco de dados
    db = conectar_banco();

    // Processar imagem
    let nome_arquivo = '';
    if (files.imagem_capa) {
      const arquivo = Array.isArray(files.imagem_capa) 
        ? files.imagem_capa[0] 
        : files.imagem_capa;

      // Gerar hash para o nome do arquivo
      const hash = crypto.createHash('md5')
        .update(Date.now().toString())
        .digest('hex');

      const extensao = path.extname(arquivo.originalFilename);
      nome_arquivo = `${hash}${extensao}`;
      
      // Validar tipo de arquivo
      const tipos_permitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!tipos_permitidos.includes(arquivo.mimetype)) {
        await fs.unlink(arquivo.filepath);
        return res.status(400).json({ erro: 'Tipo de arquivo não permitido. Use apenas JPG, PNG, GIF ou WEBP.' });
      }

      // Validar tamanho do arquivo (máximo 5MB)
      const tamanho_maximo = 5 * 1024 * 1024; // 5MB
      if (arquivo.size > tamanho_maximo) {
        await fs.unlink(arquivo.filepath);
        return res.status(400).json({ erro: 'Arquivo muito grande. Tamanho máximo permitido: 5MB' });
      }

      // Mover arquivo para localização final
      const caminho_final = path.join(process.cwd(), 'public/imgs/projetos', nome_arquivo);
      await fs.rename(arquivo.filepath, caminho_final);
    }

    // Extrair dados do form e garantir que são strings
    const nome_Projeto = fields.nome_Projeto?.[0] || fields.nome_Projeto || '';
    const nome_equipe = fields.nome_equipe?.[0] || fields.nome_equipe || '';
    const descricao = fields.descricao?.[0] || fields.descricao || '';
    const turma = fields.turma?.[0] || fields.turma || '';
    const tlr = fields.tlr?.[0] || fields.tlr || '0';
    const cea = fields.cea?.[0] || fields.cea || '0';
    const area_atuacao = fields.area_atuacao?.[0] || fields.area_atuacao || '';

    // Parse dos arrays
    const ods_ids = fields.ods_ids ? JSON.parse(fields.ods_ids) : [];
    const linha_extensao_ids = fields.linha_extensao_ids ? JSON.parse(fields.linha_extensao_ids) : [];
    const area_tematica_ids = fields.area_tematica_ids ? JSON.parse(fields.area_tematica_ids) : [];

    // Validações básicas
    if (!nome_Projeto.trim()) {
      return res.status(400).json({ erro: 'Nome do projeto é obrigatório' });
    }

    if (!nome_equipe.trim()) {
      return res.status(400).json({ erro: 'Nome da equipe é obrigatório' });
    }

    if (!descricao.trim()) {
      return res.status(400).json({ erro: 'Descrição é obrigatória' });
    }

    // Verifica se o projeto já existe (case insensitive)
    const projeto_existente = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM Projetos WHERE UPPER(nome_Projeto) = UPPER(?)',
        [nome_Projeto],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (projeto_existente) {
      return res.status(400).json({ erro: 'Já existe um projeto com este nome' });
    }

    // Validação dos IDs de ODS
    if (ods_ids) {
      const ods_validos = await new Promise((resolve, reject) => {
        db.get(
          'SELECT COUNT(*) as count FROM ODS WHERE id IN (' + ods_ids.join(',') + ')',
          [],
          (err, row) => {
            if (err) reject(err);
            resolve(row.count === ods_ids.length);
          }
        );
      });

      if (!ods_validos) {
        return res.status(400).json({ erro: 'Um ou mais ODS selecionados são inválidos' });
      }
    }

    // Inicia a transação
    await new Promise((resolve, reject) => {
      db.run("BEGIN TRANSACTION", (err) => err ? reject(err) : resolve());
    });

    // Convertendo para Promise para melhor controle do fluxo assíncrono
    const inserir_projeto = () => {
      return new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO Projetos
          (nome_Projeto, nome_equipe, tlr, imagem_capa, turma, descricao, cea, Ativo, area_atuacao)
          VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, 
          [
            nome_Projeto,
            nome_equipe,
            tlr,
            nome_arquivo,
            turma,
            descricao,
            cea,
            true,
            area_atuacao
          ],
          function(err) {
            if (err) {
              console.error('Erro na inserção:', err);
              reject(err);
              return;
            }
            resolve(this.lastID);
          }
        );
      });
    };

    const projeto_id = await inserir_projeto();

    // Insere os ODS selecionados
    if (ods_ids && ods_ids.length > 0) {
      for (const ods_id of ods_ids) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO ProjetoODS (projeto_id, ods_id) VALUES (?, ?)`,
            [projeto_id, ods_id],
            (err) => err ? reject(err) : resolve()
          );
        });
      }
    }

    // Insere as Linhas de Extensão
    if (linha_extensao_ids && linha_extensao_ids.length > 0) {
      for (const linha_id of linha_extensao_ids) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO ProjetoLinhaExtensao (projeto_id, linha_extensao_id) VALUES (?, ?)`,
            [projeto_id, linha_id],
            (err) => err ? reject(err) : resolve()
          );
        });
      }
    }

    // Insere as Áreas Temáticas
    if (area_tematica_ids && area_tematica_ids.length > 0) {
      for (const area_id of area_tematica_ids) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO ProjetoAreaTematica (projeto_id, area_tematica_id) VALUES (?, ?)`,
            [projeto_id, area_id],
            (err) => err ? reject(err) : resolve()
          );
        });
      }
    }

    // Commit da transação
    await new Promise((resolve, reject) => {
      db.run("COMMIT", (err) => err ? reject(err) : resolve());
    });

    db.close();

    return res.status(201).json({ 
      mensagem: "Projeto cadastrado com sucesso!", 
      projeto_id 
    });

  } catch (erro) {
    console.error("Erro ao cadastrar projeto:", erro);
    
    // Rollback em caso de erro
    if (db) {
      await new Promise((resolve) => {
        db.run("ROLLBACK", () => {
          db.close();
          resolve();
        });
      });
    }

    return res.status(500).json({ erro: "Erro ao cadastrar projeto" });
  }
}
