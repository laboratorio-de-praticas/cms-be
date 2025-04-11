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
  if (req.method !== 'PUT') {
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
    const camposObrigatorios = ['id_projeto', 'nome_projeto', 'nome_equipe', 'tlr', 'turma', 'descricao', 'cea', 'area_atuacao'];
    for (const campo of camposObrigatorios) {
      const valor = getFieldValue(campo);
      if (!valor || valor.trim() === '') {
        return res.status(400).json({ erro: `Campo ${campo} é obrigatório e não pode estar vazio` });
      }
    }

    // Conectar ao banco de dados
    db = await conectar_banco();
    console.log('Banco de dados conectado');

    // Verificar se o projeto existe
    const projetoExistente = await db.get(
      'SELECT * FROM Projetos WHERE id_projeto = ?',
      [getFieldValue('id_projeto')]
    );

    if (!projetoExistente) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    // Iniciar transação
    await db.run('BEGIN TRANSACTION');

    try {
      // Processar imagem de capa
      let imagem_capa = projetoExistente.imagem_capa;
      if (files.capa && files.capa[0]) {
        const capa = files.capa[0];
        const extensao = path.extname(capa.originalFilename);
        const nomeArquivo = `${crypto.randomUUID()}${extensao}`;
        const caminhoArquivo = path.join(process.cwd(), 'public', 'imgs', 'projetos', 'capa', nomeArquivo);
        
        await fs.mkdir(path.dirname(caminhoArquivo), { recursive: true });
        await fs.copyFile(capa.filepath, caminhoArquivo);
        
        imagem_capa = `/imgs/projetos/capa/${nomeArquivo}`;

        // Remover imagem antiga se existir e não for a padrão
        if (projetoExistente.imagem_capa && projetoExistente.imagem_capa !== '/imgs/projetos/capa/padrao.png') {
          const caminhoAntigo = path.join(process.cwd(), 'public', projetoExistente.imagem_capa);
          try {
            await fs.unlink(caminhoAntigo);
          } catch (error) {
            console.error('Erro ao remover imagem antiga:', error);
          }
        }
      }

      // Atualizar projeto
      const stmt = await db.prepare(`
        UPDATE Projetos SET
          nome_projeto = ?,
          nome_equipe = ?,
          tlr = ?,
          imagem_capa = ?,
          turma = ?,
          descricao = ?,
          cea = ?,
          area_atuacao = ?
        WHERE id_projeto = ?
      `);

      await stmt.run(
        getFieldValue('nome_projeto').trim(),
        getFieldValue('nome_equipe').trim(),
        parseInt(getFieldValue('tlr')),
        imagem_capa,
        getFieldValue('turma').trim(),
        getFieldValue('descricao').trim(),
        parseInt(getFieldValue('cea')),
        getFieldValue('area_atuacao').trim(),
        parseInt(getFieldValue('id_projeto'))
      );

      await stmt.finalize();

      // Processar imagens adicionais
      if (files.imagens && files.imagens.length > 0) {
        // Remover imagens antigas
        await db.run('DELETE FROM ImagensProjeto WHERE projeto_id = ?', [getFieldValue('id_projeto')]);

        for (const imagem of files.imagens) {
          const extensao = path.extname(imagem.originalFilename);
          const nomeArquivo = `${crypto.randomUUID()}${extensao}`;
          const caminhoArquivo = path.join(process.cwd(), 'public', 'imgs', 'projetos', 'imagens', nomeArquivo);
          
          await fs.mkdir(path.dirname(caminhoArquivo), { recursive: true });
          await fs.copyFile(imagem.filepath, caminhoArquivo);
          
          const imagemUrl = `/imgs/projetos/imagens/${nomeArquivo}`;
          await db.run(
            'INSERT INTO ImagensProjeto (projeto_id, imagem_url) VALUES (?, ?)',
            [getFieldValue('id_projeto'), imagemUrl]
          );
        }
      }

      // Processar ODS
      const odsIds = getFieldValue('ods_ids');
      if (odsIds) {
        await db.run('DELETE FROM ProjetoODS WHERE projeto_id = ?', [getFieldValue('id_projeto')]);
        const odsArray = JSON.parse(odsIds);
        for (const odsId of odsArray) {
          await db.run(
            'INSERT INTO ProjetoODS (projeto_id, ods_id) VALUES (?, ?)',
            [getFieldValue('id_projeto'), odsId]
          );
        }
      }

      // Processar Linhas de Extensão
      const linhaIds = getFieldValue('linhas_extensao_ids');
      if (linhaIds) {
        await db.run('DELETE FROM ProjetoLinhaExtensao WHERE projeto_id = ?', [getFieldValue('id_projeto')]);
        const linhaArray = JSON.parse(linhaIds);
        for (const linhaId of linhaArray) {
          await db.run(
            'INSERT INTO ProjetoLinhaExtensao (projeto_id, linha_extensao_id) VALUES (?, ?)',
            [getFieldValue('id_projeto'), linhaId]
          );
        }
      }

      // Processar Áreas Temáticas
      const areaIds = getFieldValue('areas_tematicas_ids');
      if (areaIds) {
        await db.run('DELETE FROM ProjetoAreaTematica WHERE projeto_id = ?', [getFieldValue('id_projeto')]);
        const areaArray = JSON.parse(areaIds);
        for (const areaId of areaArray) {
          await db.run(
            'INSERT INTO ProjetoAreaTematica (projeto_id, area_tematica_id) VALUES (?, ?)',
            [getFieldValue('id_projeto'), areaId]
          );
        }
      }

      // Processar Integrantes
      const integranteIds = getFieldValue('integrantes_ids');
      if (integranteIds) {
        await db.run('DELETE FROM IntegrantesEquipe WHERE projeto_id = ?', [getFieldValue('id_projeto')]);
        const integranteArray = JSON.parse(integranteIds);
        for (const integranteId of integranteArray) {
          await db.run(
            'INSERT INTO IntegrantesEquipe (projeto_id, usuario_id) VALUES (?, ?)',
            [getFieldValue('id_projeto'), integranteId]
          );
        }
      }

      // Commit da transação
      await db.run('COMMIT');

      // Buscar o projeto atualizado
      const projetoAtualizado = await db.get(
        'SELECT * FROM Projetos WHERE id_projeto = ?',
        [getFieldValue('id_projeto')]
      );

      return res.status(200).json({
        mensagem: 'Projeto atualizado com sucesso',
        projeto: {
          id_projeto: projetoAtualizado.id_projeto,
          nome_projeto: projetoAtualizado.nome_projeto,
          nome_equipe: projetoAtualizado.nome_equipe,
          tlr: projetoAtualizado.tlr,
          turma: projetoAtualizado.turma,
          descricao: projetoAtualizado.descricao,
          cea: projetoAtualizado.cea,
          area_atuacao: projetoAtualizado.area_atuacao,
          imagem_capa: projetoAtualizado.imagem_capa
        }
      });

    } catch (error) {
      // Rollback em caso de erro
      await db.run('ROLLBACK');
      console.error('Erro ao atualizar projeto:', error);
      throw error;
    }

  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
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