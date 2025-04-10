import conectar_banco from '@/config/database';
import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  try {
    // Verificar autenticação
    const auth = await authMiddleware(req, res);
    if (!auth.success) {
      return res.status(401).json({ mensagem: auth.mensagem });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ mensagem: 'ID do projeto é obrigatório' });
    }

    const db = await conectar_banco();

    // Busca o projeto com todas as relações
    const projeto = await db.get(`
      SELECT 
        p.*,
        GROUP_CONCAT(DISTINCT o.descricao) as ods_descricoes,
        GROUP_CONCAT(DISTINCT o.id) as ods_ids,
        GROUP_CONCAT(DISTINCT le.descricao) as linhas_extensao_descricoes,
        GROUP_CONCAT(DISTINCT le.id) as linhas_extensao_ids,
        GROUP_CONCAT(DISTINCT at.descricao) as areas_tematicas_descricoes,
        GROUP_CONCAT(DISTINCT at.id) as areas_tematicas_ids,
        GROUP_CONCAT(DISTINCT ie.nome_integrante) as integrantes,
        GROUP_CONCAT(DISTINCT ip.url_imagem) as imagens_projeto
      FROM Projetos p
      LEFT JOIN ProjetoODS po ON p.id = po.projeto_id
      LEFT JOIN ODS o ON po.ods_id = o.id
      LEFT JOIN ProjetoLinhaExtensao ple ON p.id = ple.projeto_id
      LEFT JOIN LinhaExtensao le ON ple.linha_extensao_id = le.id
      LEFT JOIN ProjetoAreaTematica pat ON p.id = pat.projeto_id
      LEFT JOIN AreaTematica at ON pat.area_tematica_id = at.id
      LEFT JOIN IntegrantesEquipe ie ON p.id = ie.projeto_id
      LEFT JOIN Imagens_Projeto ip ON p.id = ip.id_projeto
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    if (!projeto) {
      return res.status(404).json({ mensagem: 'Projeto não encontrado' });
    }

    // Processa os resultados
    const projeto_formatado = {
      id: projeto.id,
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
    };

    await db.close();

    return res.status(200).json({
      mensagem: 'Projeto recuperado com sucesso',
      projeto: projeto_formatado
    });

  } catch (erro) {
    console.error('Erro ao buscar projeto:', erro);
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
}