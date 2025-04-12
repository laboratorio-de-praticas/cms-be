const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function conectar_banco() {
    try {
        const client = await pool.connect();
        console.log('Conectado ao banco PostgreSQL com sucesso');
        return client;
    } catch (erro) {
        console.error('Erro ao conectar com o banco PostgreSQL:', erro.message);
        throw erro;
    }
}

module.exports = { conectar_banco }; 