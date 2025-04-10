import sqlite3 from "sqlite3"
import path from "path"

const conectar_banco = () => {
    const dbPath = path.join(process.cwd(), "src", "database", "cms_db.sqlite3");
    return new sqlite3.Database(dbPath);
  };

  