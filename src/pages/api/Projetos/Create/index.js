import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { conectar_banco } from '@/config/database';
 
// Configuração para permitir o parsing do form-data
export const config = {
  api: {
    bodyParser: false,
  },
};
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }
 
  let client;
  try {
    // Criar diretório se não existir
    await fs.mkdir(path.join(process.cwd(), 'public/imgs/projetos'), { recursive: true });
    await fs.mkdir(path.join(process.cwd(), 'public/imgs/projetos/capas'), { recursive: true });
    await fs.mkdir(path.join(process.cwd(), 'public/imgs/projetos/Imagens_Projeto'), { recursive: true });
 
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'public/imgs/projetos'),
      keepExtensions: true,
      multiples: true, // Permitir múltiplos arquivos
    });
 
    // Parse do form-data
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
 
    // Parsing do JSON contido no campo dados
    const dadosJSON = fields.dados ? JSON.parse(fields.dados) : {};
 
    // Extrair dados do JSON
    const {
      nome_Projeto = '',
      nome_equipe = '',
      descricao = '',
      turma = '',
      tlr = '0',
      cea = '0',
      area_atuacao = '',
      ods_ids = [],
      linha_extensao_ids = [],
      area_tematica_ids = [],
      integrantes = []
    } = dadosJSON;
 
    // Conectar ao banco de dados
    client = await conectar_banco();
 
    // Processar imagem de capa
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
        return res.status(400).json({ mensagem: 'Tipo de arquivo não permitido. Use apenas JPG, PNG, GIF ou WEBP.' });
      }
 
      // Validar tamanho do arquivo (máximo 5MB)
      const tamanho_maximo = 5 * 1024 * 1024; // 5MB
      if (arquivo.size > tamanho_maximo) {
        await fs.unlink(arquivo.filepath);
        return res.status(400).json({ erro: 'Arquivo muito grande. Tamanho máximo permitido: 5MB' });
      }
 
      // Mover arquivo para localização final
      const caminho_final = path.join(process.cwd(), 'public/imgs/projetos/capas', nome_arquivo);
      await fs.rename(arquivo.filepath, caminho_final);
    }
 
    // Processar múltiplas imagens do projeto
    const imagens_projeto = [];
    if (files.imagens_projeto) {
      const arquivos = Array.isArray(files.imagens_projeto) 
        ? files.imagens_projeto 
        : [files.imagens_projeto];
      for (const arquivo of arquivos) {
        // Gerar hash para o nome do arquivo
        const hash = crypto.createHash('md5')
          .update(Date.now().toString() + Math.random().toString())
          .digest('hex');
 
        const extensao = path.extname(arquivo.originalFilename);
        const nome_imagem = `${hash}${extensao}`;
        // Validar tipo de arquivo
        const tipos_permitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!tipos_permitidos.includes(arquivo.mimetype)) {
          await fs.unlink(arquivo.filepath);
          continue; // Pula este arquivo e continua com os próximos
        }
 
        // Validar tamanho do arquivo (máximo 5MB)
        const tamanho_maximo = 5 * 1024 * 1024; // 5MB
        if (arquivo.size > tamanho_maximo) {
          await fs.unlink(arquivo.filepath);
          continue; // Pula este arquivo e continua com os próximos
        }
 
        // Mover arquivo para localização final
        const caminho_final = path.join(process.cwd(), 'public/imgs/projetos/Imagens_Projeto', nome_imagem);
        await fs.rename(arquivo.filepath, caminho_final);
        // Adicionar o nome da imagem à lista
        imagens_projeto.push(nome_imagem);
      }
    }
 
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
    const projeto_existente = await client.query(
      'SELECT id_projeto FROM "Projetos" WHERE UPPER(titulo) = UPPER($1)',
      [nome_Projeto]
    );
 
    if (projeto_existente.rows.length > 0) {
      return res.status(400).json({ erro: 'Já existe um projeto com este nome' });
    }
 
    // Validação dos IDs de ODS
    if (ods_ids && ods_ids.length > 0) {
      console.log('Validando ODS:', ods_ids);
      
      // Primeiro, vamos verificar se os ODS existem
      const ods_validos = await client.query(
        'SELECT id_ods FROM "ODS" WHERE id_ods = ANY($1::int[])',
        [ods_ids]
      );
      
      console.log('ODS encontrados:', ods_validos.rows);
      
      if (ods_validos.rows.length !== ods_ids.length) {
        console.log('Erro: Número de ODS encontrados diferente do esperado');
        return res.status(400).json({ 
          erro: 'Um ou mais ODS selecionados são inválidos',
          detalhes: {
            enviados: ods_ids,
            encontrados: ods_validos.rows.map(row => row.id_ods)
          }
        });
      }
    }
 
    // Inicia a transação
    await client.query('BEGIN');
 
    // Inserir projeto
    const result = await client.query(
      `INSERT INTO "Projetos"
       (titulo, nome_equipe, tlr, foto_url, turma, descricao, cea, ativo)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id_projeto`,
      [
        nome_Projeto,
        nome_equipe,
        tlr,
        nome_arquivo,
        turma,
        descricao,
        cea,
        true
      ]
    );
 
    const projeto_id = result.rows[0].id_projeto;
 
    // Insere os ODS selecionados
    if (ods_ids && ods_ids.length > 0) {
      for (const ods_id of ods_ids) {
        await client.query(
          `INSERT INTO "ProjetoODS" (projeto_id, ods_id) VALUES ($1, $2)`,
          [projeto_id, ods_id]
        );
      }
    }
 
    // Insere as Linhas de Extensão
    if (linha_extensao_ids && linha_extensao_ids.length > 0) {
      for (const linha_id of linha_extensao_ids) {
        await client.query(
          `INSERT INTO "ProjetoLinhaExtensao" (projeto_id, linha_extensao_id) VALUES ($1, $2)`,
          [projeto_id, linha_id]
        );
      }
    }
 
    // Insere as Áreas Temáticas
    if (area_tematica_ids && area_tematica_ids.length > 0) {
      for (const area_id of area_tematica_ids) {
        await client.query(
          `INSERT INTO "CategoriasProjetos" (fk_id_projeto, fk_id_categoria) VALUES ($1, $2)`,
          [projeto_id, area_id]
        );
      }
    }
 
    // Insere os integrantes
    if (integrantes && integrantes.length > 0) {
      const alunos_nao_encontrados = [];
      
      for (const nome_integrante of integrantes) {
        // Buscar o ID do aluno pelo nome
        const aluno = await client.query(
          `SELECT a.id_aluno 
           FROM "Alunos" a 
           JOIN "Usuarios" u ON a.fk_id_usuario = u.id 
           WHERE u.nome = $1`,
          [nome_integrante]
        );

        if (aluno.rows.length === 0) {
          alunos_nao_encontrados.push(nome_integrante);
        } else {
          const aluno_id = aluno.rows[0].id_aluno;
          await client.query(
            `INSERT INTO "integrantesequipe" (projeto_id, aluno_id) VALUES ($1, $2)`,
            [projeto_id, aluno_id]
          );
        }
      }

      if (alunos_nao_encontrados.length > 0) {
        // Rollback da transação
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          erro: 'Alunos não encontrados',
          detalhes: alunos_nao_encontrados
        });
      }
    }
 
    // Insere as imagens do projeto
    if (imagens_projeto && imagens_projeto.length > 0) {
      for (const imagem_url of imagens_projeto) {
        await client.query(
          `INSERT INTO "ImagensProjeto" (projeto_id, imagem_url) VALUES ($1, $2)`,
          [projeto_id, imagem_url]
        );
      }
    }
 
    // Commit da transação
    await client.query('COMMIT');
 
    return res.status(201).json({ 
      mensagem: "Projeto cadastrado com sucesso!", 
      projeto_id 
    });
 
  } catch (erro) {
    console.error("Erro ao cadastrar projeto:", erro);
    // Rollback em caso de erro
    if (client) {
      await client.query('ROLLBACK');
    }
 
    return res.status(500).json({ erro: "Erro ao cadastrar projeto" });
  } finally {
    if (client) {
      client.release();
    }
  }
}