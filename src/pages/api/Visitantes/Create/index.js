import { conectar_banco } from '@/config/database';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { nome, telefone } = req.body;

  if (!nome || !telefone) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  const client = await conectar_banco();
  
  try {
    // Iniciar transação
    await client.query('BEGIN');

    // Verificar se o telefone já existe
    const visitanteExistente = await client.query(
      'SELECT * FROM "Visitantes" WHERE telefone = $1',
      [telefone]
    );

    if (visitanteExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ erro: 'Telefone já cadastrado' });
    }

    // Gerar chave de acesso aleatória de 4 dígitos
    const chave_acesso = Math.floor(1000 + Math.random() * 9000).toString();

    // Inserir novo visitante
    const result = await client.query(
      `INSERT INTO "Visitantes" 
       (nome, telefone, chave_acesso) 
       VALUES ($1, $2, $3) 
       RETURNING id_visitante, nome, telefone, chave_acesso, data_criacao`,
      [nome, telefone, chave_acesso]
    );

    // Commit da transação
    await client.query('COMMIT');

    return res.status(201).json({ 
      mensagem: 'Visitante cadastrado com sucesso!',
      dados: result.rows[0]
    });
  } catch (erro) {
    await client.query('ROLLBACK');
    console.error('Erro ao cadastrar visitante:', erro);
    return res.status(500).json({ 
      erro: 'Erro ao cadastrar visitante',
      detalhes: process.env.NODE_ENV === 'development' ? erro.message : undefined
    });
  } finally {
    await client.end();
  }
}