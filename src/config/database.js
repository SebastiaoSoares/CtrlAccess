import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const env_pass = process.env.ADMIN_PASS || 'admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new Database(dbPath, { 
});

console.log(`Base de dados SQLite carregada de: ${dbPath}`);

export const initDB = async () => {

    db.exec(/*sql*/`

        -- Tabela de Utilizadores (Segurança)
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            panel_access INTEGER DEFAULT 1,

            name TEXT,
            registration TEXT UNIQUE,
            cpf TEXT UNIQUE,
            password_device TEXT,
            groups TEXT,
            device_admin INTEGER DEFAULT 0,
            photo TEXT,

            observations TEXT,
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
            mode TEXT DEFAULT 'normalMode',
            sip_active INTEGER DEFAULT 0,
            sip_server TEXT,
            sip_user TEXT,
            sip_password TEXT,
            sip_target_ramal TEXT
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

        -- Tabela de Logs (Auditoria e Monitoramento)
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            device_id INTEGER,
            user_id INTEGER,
            event_type TEXT NOT NULL, -- Ex: 'ACCESS', 'SYSTEM', 'INTERCOM', 'ADMIN'
            action TEXT NOT NULL,     -- Ex: 'DOOR_OPENED', 'ACCESS_DENIED', 'CALL_REQUESTED'
            status TEXT,              -- Ex: 'SUCCESS', 'FAILED', 'WARNING'
            details TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (device_id) REFERENCES devices(id)
        );

        -- Índices essenciais para não travar o Node.js/Go quando a tabela ficar gigante:
        CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_device_id ON logs(device_id);
        CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_logs_event_type ON logs(event_type);
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
