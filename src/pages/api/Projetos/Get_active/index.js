import conectar_banco from '@/config/database';
// import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  let db;
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ mensagem: auth.mensagem });
    // }

    db = await conectar_banco();

    // Busca apenas projetos ativos com suas relações
    const projetos = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          p.*,
          GROUP_CONCAT(DISTINCT o.descricao) as ods_descricoes,
          GROUP_CONCAT(DISTINCT o.id_ods) as ods_ids,
          GROUP_CONCAT(DISTINCT le.descricao) as linhas_extensao_descricoes,
          GROUP_CONCAT(DISTINCT le.id_linha) as linhas_extensao_ids,
          GROUP_CONCAT(DISTINCT at.descricao) as areas_tematicas_descricoes,
          GROUP_CONCAT(DISTINCT at.id_area) as areas_tematicas_ids,
          GROUP_CONCAT(DISTINCT u.nome) as integrantes,
          GROUP_CONCAT(DISTINCT ip.imagem_url) as imagens_projeto
        FROM Projetos p
        LEFT JOIN ProjetoODS po ON p.id_projeto = po.projeto_id
        LEFT JOIN ODS o ON po.ods_id = o.id_ods
        LEFT JOIN ProjetoLinhaExtensao ple ON p.id_projeto = ple.projeto_id
        LEFT JOIN LinhaExtensao le ON ple.linha_extensao_id = le.id_linha
        LEFT JOIN ProjetoAreaTematica pat ON p.id_projeto = pat.projeto_id
        LEFT JOIN AreaTematica at ON pat.area_tematica_id = at.id_area
        LEFT JOIN IntegrantesEquipe ie ON p.id_projeto = ie.projeto_id
        LEFT JOIN Usuario u ON ie.usuario_id = u.id_usuario
        LEFT JOIN ImagensProjeto ip ON p.id_projeto = ip.projeto_id
        WHERE p.ativo = 1
        GROUP BY p.id_projeto
        ORDER BY p.id_projeto DESC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    // Processa os resultados
    const projetos_formatados = projetos.map(projeto => ({
      id: projeto.id_projeto,
      nome_projeto: projeto.nome_projeto,
      nome_equipe: projeto.nome_equipe,
      tlr: projeto.tlr,
      imagem_capa: projeto.imagem_capa,
      turma: projeto.turma,
      descricao: projeto.descricao,
      cea: projeto.cea,
      ativo: projeto.ativo === 1,
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
      imagens: projeto.imagens_projeto ? projeto.imagens_projeto.split(',') : []
    }));

    return res.status(200).json({
      mensagem: 'Projetos ativos recuperados com sucesso',
      projetos: projetos_formatados
    });

  } catch (erro) {
    console.error('Erro ao buscar projetos ativos:', erro);
    return res.status(500).json({ 
      mensagem: 'Erro interno do servidor',
      erro: erro.message 
    });
  } finally {
    if (db) {
      try {
        await new Promise((resolve, reject) => {
          db.close((err) => {
            if (err) {
              console.error('Erro ao fechar conexão com o banco:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      } catch (erro) {
        console.error('Erro ao fechar conexão com o banco:', erro);
      }
    }
  }
}