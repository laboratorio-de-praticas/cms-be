import { conectar_banco } from "@/config/database";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ mensagem: "Método não permitido" });
  }

  const client = await conectar_banco();

  try {
    const query = `
      SELECT 
        a."id_aluno",
        a."ra",
        a."curso_semestre",
        a."deseja_ser_candidato",
        a."foto_url",
        a."data_matricula",
        r."id_representante",
        r."representantesituacao",
        r."fk_id_evento",
        u."nome" as nome_usuario -- Adicionando a coluna "nome" da tabela usuario
      FROM "Alunos" a
      LEFT JOIN "Representantes" r ON a."id_aluno" = r."fk_id_aluno"
      LEFT JOIN "Usuarios" u ON u."id" = a."fk_id_usuario" -- Garantindo que a coluna do usuário seja usada corretamente
      ORDER BY a."ra" ASC
    `;

    const result = await client.query(query);
    const alunos = result.rows;

    // Verificação no console para garantir que os dados estão vindo corretamente
    console.log("Alunos retornados do banco:", alunos);

    return res.status(200).json({
      mensagem: "Alunos e representantes listados com sucesso",
      total: alunos.length,
      dados: alunos,
    });
  } catch (error) {
    console.error("Erro ao listar alunos:", error);
    return res.status(500).json({
      mensagem: "Erro ao listar alunos",
      detalhes: error.message,
    });
  } finally {
    client.release();
  }
}
