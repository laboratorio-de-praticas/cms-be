const conectar_banco = require('@/config/database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  let db;
  try {
    db = conectar_banco();

    // Busca projetos com todas as relações
    const projetos = await new Promise((resolve, reject) => {
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
        GROUP BY p.id
        ORDER BY p.id DESC
      `;

      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        // Processa os resultados
        const projetos_formatados = rows.map(projeto => ({
          id: projeto.id,
          nome_Projeto: projeto.nome_Projeto,
          nome_equipe: projeto.nome_equipe,
          tlr: projeto.tlr,
          imagem_capa: projeto.imagem_capa,
          turma: projeto.turma,
          descricao: projeto.descricao,
          cea: projeto.cea,
          Ativo: projeto.Ativo === 1,
          area_atuacao: projeto.area_atuacao,
          ods: projeto.ods_descricoes ? {
            ids: projeto.ods_ids?.split(',').map(Number) || [],
            descricoes: projeto.ods_descricoes?.split(',') || []
          } : { ids: [], descricoes: [] },
          linhas_extensao: projeto.linhas_extensao_descricoes ? {
            ids: projeto.linhas_extensao_ids?.split(',').map(Number) || [],
            descricoes: projeto.linhas_extensao_descricoes?.split(',') || []
          } : { ids: [], descricoes: [] },
          areas_tematicas: projeto.areas_tematicas_descricoes ? {
            ids: projeto.areas_tematicas_ids?.split(',').map(Number) || [],
            descricoes: projeto.areas_tematicas_descricoes?.split(',') || []
          } : { ids: [], descricoes: [] },
          integrantes: projeto.integrantes ? projeto.integrantes.split(',') : [],
          imagens_projeto: projeto.imagens_projeto ? projeto.imagens_projeto.split(',') : []
        }));

        resolve(projetos_formatados);
      });
    });

    db.close();

    return res.status(200).json({
      mensagem: 'Projetos recuperados com sucesso',
      projetos: projetos
    });

  } catch (erro) {
    console.error('Erro ao buscar projetos:', erro);
    
    if (db) {
      db.close();
    }

    return res.status(500).json({ erro: 'Erro ao buscar projetos' });
  }
}