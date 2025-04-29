import { conectar_banco } from "../../../../config/database";
// import authMiddleware from '../../../../middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensagem: 'Método não permitido' });
  }

  const client = await conectar_banco();
  
  try {
    // Verificar autenticação
    // const auth = await authMiddleware(req, res);
    // if (!auth.success) {
    //   return res.status(401).json({ mensagem: auth.mensagem });
    // }

    // Busca todos os projetos com suas relações
    const query = `
      SELECT 
        p.id_projeto,
        p.titulo,
        p.nome_equipe,
        p.descricao,
        p.tlr,
        p.cea,
        p.turma,
        p.foto_url,
        p.ativo,
        p.data_criacao,
        p.data_alteracao,
        json_agg(DISTINCT jsonb_build_object(
          'id_imagem', ip.id_imagem,
          'imagem_url', ip.imagem_url
        )) as imagens,
        json_agg(DISTINCT jsonb_build_object(
          'id_ods', o.id_ods,
          'descricao', o.descricao
        )) as ods,
        json_agg(DISTINCT jsonb_build_object(
          'id_linha', le.id_linha,
          'descricao', le.descricao
        )) as linhas_extensao,
        json_agg(DISTINCT jsonb_build_object(
          'id_categoria', c.id_categoria,
          'nome', c.nome,
          'descricao', c.descricao
        )) as categorias,
        json_agg(DISTINCT jsonb_build_object(
          'id_integrante', ie.id_integrante,
          'id_aluno', ie.aluno_id,
          'nome', u.nome
        )) as integrantes
      FROM "Projetos" p
      LEFT JOIN "ImagensProjeto" ip ON p.id_projeto = ip.projeto_id
      LEFT JOIN "ProjetoODS" po ON p.id_projeto = po.projeto_id
      LEFT JOIN "ODS" o ON po.ods_id = o.id_ods
      LEFT JOIN "ProjetoLinhaExtensao" ple ON p.id_projeto = ple.projeto_id
      LEFT JOIN "LinhaExtensao" le ON ple.linha_extensao_id = le.id_linha
      LEFT JOIN "CategoriasProjetos" cp ON p.id_projeto = cp.fk_id_projeto
      LEFT JOIN "Categorias" c ON cp.fk_id_categoria = c.id_categoria
      LEFT JOIN integrantesequipe ie ON p.id_projeto = ie.projeto_id
      LEFT JOIN "Alunos" a ON ie.aluno_id = a.id_aluno
      LEFT JOIN "Usuarios" u ON a.fk_id_usuario = u.id
      GROUP BY p.id_projeto
      ORDER BY p.data_criacao DESC
    `;

    const result = await client.query(query);

    // Processa os resultados para remover valores nulos
    const projetos = result.rows.map(projeto => ({
      ...projeto,
      imagens: projeto.imagens[0] ? projeto.imagens.filter(img => img.id_imagem) : [],
      ods: projeto.ods[0] ? projeto.ods.filter(o => o.id_ods) : [],
      linhas_extensao: projeto.linhas_extensao[0] ? projeto.linhas_extensao.filter(le => le.id_linha) : [],
      categorias: projeto.categorias[0] ? projeto.categorias.filter(c => c.id_categoria) : [],
      integrantes: projeto.integrantes[0] ? projeto.integrantes.filter(i => i.id_integrante) : []
    }));

    return res.status(200).json({
      mensagem: 'Projetos recuperados com sucesso',
      total: projetos.length,
      dados: projetos
    });

  } catch (erro) {
    console.error('Erro ao buscar projetos:', erro);
    return res.status(500).json({ 
      mensagem: 'Erro interno do servidor',
      erro: process.env.NODE_ENV === 'development' ? erro.message : undefined
    });
  } finally {
    if (client) {
      await client.release();
    }
  }
}