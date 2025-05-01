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
                a.id_aluno,
                a.foto_url,
                a.curso_semestre,
                a.ra,
                TO_CHAR(a.data_matricula, 'YYYY-MM-DD') AS data_matricula,
                u.nome,
                u.telefone,
                u.email_institucional,
                u.tipo_usuario,
                u.status_usuario
            FROM "Alunos" a
            JOIN "Usuarios" u ON a.fk_id_usuario = u.id
            WHERE LOWER(u.nome) LIKE LOWER($1)
            ORDER BY u.nome
        `, [`%${nome}%`]);
        
        return res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar alunos:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    } finally {
        if (client) {
            client.release();
        }
    }
}
