import { conectar_banco } from '../../../../config/database';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ mensagem: 'Método não permitido' });
    }

    const { nome } = req.query;

    if (!nome) {
        return res.status(400).json({ mensagem: 'Parâmetro "nome" é obrigatório' });
    }

    let client;
    try {
        client = await conectar_banco();
        
        const resultado = await client.query(`
            SELECT 
                id_projeto,
                titulo,
                nome_equipe,
                descricao,
                foto_url,
                tlr,
                cea,
                turma,
                ativo,
                data_criacao,
                data_alteracao
            FROM "Projetos"
            WHERE LOWER(titulo) LIKE LOWER($1)
            ORDER BY titulo
        `, [`%${nome}%`]);
        
        return res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar projetos:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    } finally {
        if (client) {
            client.release();
        }
    }
}
