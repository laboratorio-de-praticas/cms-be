import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import conectar_banco from '@/config/database';


// Configuração para permitir o parsing do form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Função auxiliar para obter o valor do campo
    const getFieldValue = (field) => {
      if (!fields[field]) return '';
      return Array.isArray(fields[field]) ? fields[field][0] : fields[field];
    };

    // Validação dos campos obrigatórios
    const camposObrigatorios = ['nome_projeto', 'nome_equipe', 'tlr', 'turma', 'descricao', 'cea', 'area_atuacao'];
    for (const campo of camposObrigatorios) {
      const valor = getFieldValue(campo);
      if (!valor || valor.trim() === '') {
        return res.status(400).json({ erro: `Campo ${campo} é obrigatório e não pode estar vazio` });
      }
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Processar imagem de capa
    let imagem_capa = '/imgs/projetos/capa/padrao.png';
    if (files.capa && files.capa[0]) {
      const capa = files.capa[0];
      const extensao = path.extname(capa.originalFilename);
      const nomeArquivo = `${crypto.randomUUID()}${extensao}`;
      const caminhoArquivo = path.join(process.cwd(), 'public', 'imgs', 'projetos', 'capa', nomeArquivo);
      
      await fs.mkdir(path.dirname(caminhoArquivo), { recursive: true });
      await fs.copyFile(capa.filepath, caminhoArquivo);
      
      imagem_capa = `/imgs/projetos/capa/${nomeArquivo}`;
    }


    console.log('Iniciando inserção do projeto no banco');
    const stmt = await db.prepare(`
      INSERT INTO Projetos (
        nome_projeto, nome_equipe, tlr, imagem_capa, turma, 
        descricao, cea, area_atuacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      // Inserir projeto no banco com o QR Code
      console.log('Iniciando inserção do projeto no banco');
      const stmt = await db.prepare(`
        INSERT INTO Projetos (
          nome_projeto, nome_equipe, tlr, imagem_capa, turma, 
          descricao, cea, area_atuacao, qr_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = await stmt.run(
        getFieldValue('nome_projeto').trim(),
        getFieldValue('nome_equipe').trim(),
        parseInt(getFieldValue('tlr')),
        imagem_capa,

        fields.turma,
        fields.descricao,
        fields.cea,
        fields.area_atuacao
      );

      await stmt.finalize();
      console.log('Projeto inserido com sucesso:', result);

      // Obter o ID do projeto inserido
      const id_projeto = await new Promise((resolve, reject) => {
        db.get('SELECT last_insert_rowid() as id', (err, row) => {
          if (err) reject(err);
          resolve(row.id);
        });
      });

      console.log('ID do projeto:', id_projeto);

      if (!id_projeto) {
        throw new Error('Não foi possível obter o ID do projeto inserido');
      }

      // Processar imagens adicionais
      if (files.imagens && files.imagens.length > 0) {
        for (const imagem of files.imagens) {
          const extensao = path.extname(imagem.originalFilename);
          const nomeArquivo = `${crypto.randomUUID()}${extensao}`;
          const caminhoArquivo = path.join(process.cwd(), 'public', 'imgs', 'projetos', 'imagens', nomeArquivo);
          
          await fs.mkdir(path.dirname(caminhoArquivo), { recursive: true });
          await fs.copyFile(imagem.filepath, caminhoArquivo);
          
          const imagemUrl = `/imgs/projetos/imagens/${nomeArquivo}`;
          await db.run(
            'INSERT INTO ImagensProjeto (projeto_id, imagem_url) VALUES (?, ?)',
            [id_projeto, imagemUrl]
          );
        }
      }

      // Processar ODS
      const odsIds = getFieldValue('ods_ids');
      if (odsIds) {
        const odsArray = JSON.parse(odsIds);
        for (const odsId of odsArray) {
          await db.run(
            'INSERT INTO ProjetoODS (projeto_id, ods_id) VALUES (?, ?)',
            [id_projeto, odsId]
          );
        }
      }

      // Processar Linhas de Extensão
      const linhaIds = getFieldValue('linhas_extensao_ids');
      if (linhaIds) {
        const linhaArray = JSON.parse(linhaIds);
        for (const linhaId of linhaArray) {
          await db.run(
            'INSERT INTO ProjetoLinhaExtensao (projeto_id, linha_extensao_id) VALUES (?, ?)',
            [id_projeto, linhaId]
          );
        }
      }

      // Processar Áreas Temáticas
      const areaIds = getFieldValue('areas_tematicas_ids');
      if (areaIds) {
        const areaArray = JSON.parse(areaIds);
        for (const areaId of areaArray) {
          await db.run(
            'INSERT INTO ProjetoAreaTematica (projeto_id, area_tematica_id) VALUES (?, ?)',
            [id_projeto, areaId]
          );
        }
      }

      // Processar Integrantes
      const integranteIds = getFieldValue('integrantes_ids');
      if (integranteIds) {
        const integranteArray = JSON.parse(integranteIds);
        for (const integranteId of integranteArray) {
          await db.run(
            'INSERT INTO IntegrantesEquipe (projeto_id, usuario_id) VALUES (?, ?)',
            [id_projeto, integranteId]
          );
        }
      }

      // Commit da transação
      await db.run('COMMIT');

      // Buscar o projeto inserido para confirmar
      const projetoInserido = await db.get(
        'SELECT * FROM Projetos WHERE id_projeto = ?',
        [id_projeto]
      );

      if (!projetoInserido) {
        throw new Error('Projeto não foi encontrado após inserção');
      }

      console.log('Projeto confirmado no banco:', projetoInserido);

      return res.status(201).json({
        mensagem: 'Projeto criado com sucesso',
        projeto: {
          id_projeto,
          nome_projeto: getFieldValue('nome_projeto').trim(),
          nome_equipe: getFieldValue('nome_equipe').trim(),
          tlr: parseInt(getFieldValue('tlr')),
          turma: getFieldValue('turma').trim(),
          descricao: getFieldValue('descricao').trim(),
          cea: parseInt(getFieldValue('cea')),
          area_atuacao: getFieldValue('area_atuacao').trim(),

          imagem_capa,
        }
      });

    } catch (error) {
      // Rollback em caso de erro
      await db.run('ROLLBACK');
      console.error('Erro ao inserir projeto:', error);
      throw error;
    }

  } catch (error) {
    console.error('Erro ao criar projeto:', error);
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

export default handler;
