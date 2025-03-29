const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ajustando o caminho absoluto para o banco
const caminho_banco = path.join(process.cwd(), 'src', 'database', 'cms_db.sqlite3');

function conectar_banco() {
    // Verifica se o diretório existe, se não, cria
    const dir = path.dirname(caminho_banco);
    if (!require('fs').existsSync(dir)) {
        require('fs').mkdirSync(dir, { recursive: true });
    }

    const db = new sqlite3.Database(caminho_banco, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (erro) => {
        if (erro) {
            console.error('Erro ao conectar com o banco cms_db_sqlite3:', erro.message);
            return;
        }
        console.log('Conectado ao banco cms_db_sqlite3 com sucesso');
    });

    return db;
}

module.exports = conectar_banco; 