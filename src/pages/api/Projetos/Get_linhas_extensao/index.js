import { conectar_banco } from '../../../../config/database';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ mensagem: 'Método não permitido' });
    }

    let client;
    try {
        client = await conectar_banco();
        
        const resultado = await client.query('SELECT * FROM "LinhaExtensao" ORDER BY id_linha');
        
        return res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar linhas de extensão:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    } finally {
        if (client) {
            client.release();
        }
    }
}
