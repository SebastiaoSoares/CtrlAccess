import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const env_pass = process.env.ADMIN_PASS || 'admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new Database(dbPath, { 
});

console.log(`Base de dados SQLite carregada de: ${dbPath}`);

export const initDB = async () => {

    db.exec(`
        -- Tabela de Utilizadores (Segurança)
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'admin'
        );

        -- Tabela de Dispositivos (Gestão de Dispositivos)
        CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            sector_group TEXT NOT NULL,
            ip TEXT NOT NULL,
            port TEXT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            status TEXT DEFAULT 'offline',
            mode TEXT DEFAULT 'normalMode'
        );

        -- Tabela de Regras (Automação e Schedules)
        CREATE TABLE IF NOT EXISTS schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            group_target TEXT NOT NULL,
            time_start TEXT NOT NULL,
            time_end TEXT NOT NULL,
            days TEXT NOT NULL, -- Guardamos o array [1,2,3] como String JSON
            mode TEXT NOT NULL
        );
    `);

    const adminExists = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
    if (!adminExists) {
        const hash = await bcrypt.hash(env_pass, 10);
        const insertAdmin = db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
        insertAdmin.run('admin', hash);
        console.log('Utilizador admin criado. Credenciais -> admin : ' + env_pass);
    }

    console.log('Base de dados SQLite inicializada com sucesso.');
};

export default db;
