const conectar_banco = require('@/config/database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ erro: 'ID do projeto é obrigatório' });
  }

  let db;
  try {
    db = conectar_banco();

    // Busca o projeto específico com todas suas relações
    const projeto = await new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          p.*,
          GROUP_CONCAT(DISTINCT o.descricao) as ods_descricoes,
          GROUP_CONCAT(DISTINCT o.id) as ods_ids,
          GROUP_CONCAT(DISTINCT le.descricao) as linhas_extensao_descricoes,
          GROUP_CONCAT(DISTINCT le.id) as linhas_extensao_ids,
          GROUP_CONCAT(DISTINCT at.descricao) as areas_tematicas_descricoes,
          GROUP_CONCAT(DISTINCT at.id) as areas_tematicas_ids,
          GROUP_CONCAT(DISTINCT ie.nome_integrante) as integrantes,
          GROUP_CONCAT(DISTINCT ip.imagem_url) as imagens_projeto
        FROM Projetos p
        LEFT JOIN ProjetoODS po ON p.id = po.projeto_id
        LEFT JOIN ODS o ON po.ods_id = o.id
        LEFT JOIN ProjetoLinhaExtensao ple ON p.id = ple.projeto_id
        LEFT JOIN LinhaExtensao le ON ple.linha_extensao_id = le.id
        LEFT JOIN ProjetoAreaTematica pat ON p.id = pat.projeto_id
        LEFT JOIN AreaTematica at ON pat.area_tematica_id = at.id
        LEFT JOIN IntegrantesEquipe ie ON p.id = ie.projeto_id
        LEFT JOIN ImagensProjeto ip ON p.id = ip.projeto_id
        WHERE p.id = ?
        GROUP BY p.id
      `;

      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        // Processa o resultado
        const projeto_formatado = {
          id: row.id,
          nome_Projeto: row.nome_Projeto,
          nome_equipe: row.nome_equipe,
          tlr: row.tlr,
          imagem_capa: row.imagem_capa,
          turma: row.turma,
          descricao: row.descricao,
          cea: row.cea,
          Ativo: row.Ativo === 1,
          area_atuacao: row.area_atuacao,
          ods: row.ods_descricoes ? {
            ids: row.ods_ids?.split(',').map(Number) || [],
            descricoes: row.ods_descricoes?.split(',') || []
          } : { ids: [], descricoes: [] },
          linhas_extensao: row.linhas_extensao_descricoes ? {
            ids: row.linhas_extensao_ids?.split(',').map(Number) || [],
            descricoes: row.linhas_extensao_descricoes?.split(',') || []
          } : { ids: [], descricoes: [] },
          areas_tematicas: row.areas_tematicas_descricoes ? {
            ids: row.areas_tematicas_ids?.split(',').map(Number) || [],
            descricoes: row.areas_tematicas_descricoes?.split(',') || []
          } : { ids: [], descricoes: [] },
          integrantes: row.integrantes ? row.integrantes.split(',') : [],
          imagens_projeto: row.imagens_projeto ? row.imagens_projeto.split(',') : []
        };

        resolve(projeto_formatado);
      });
    });

    db.close();

    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    return res.status(200).json({
      mensagem: 'Projeto recuperado com sucesso',
      projeto: projeto
    });

  } catch (erro) {
    console.error('Erro ao buscar projeto:', erro);
    
    if (db) {
      db.close();
    }

    return res.status(500).json({ erro: 'Erro ao buscar projeto' });
  }
}