import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const appLogPath = path.join(logDir, 'app.log');
const errorLogPath = path.join(logDir, 'error.log');

const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });
};

const colors = {
    INFO: '\x1b[36m',     // Ciano
    SUCCESS: '\x1b[32m',  // Verde
    WARN: '\x1b[33m',     // Amarelo
    ERROR: '\x1b[31m',    // Vermelho
    HARDWARE: '\x1b[35m', // Magenta (Especial para Dispositivos)
    RESET: '\x1b[0m'      // Volta ao normal
};

const writeLog = (level, message) => {
    const timestamp = getTimestamp();
    const logLine = `[${timestamp}] [${level}] ${message}\n`;

    console.log(`${colors[level]}[${timestamp}] [${level}] ${message}${colors.RESET}`);

    fs.appendFileSync(appLogPath, logLine, 'utf8');

    if (level === 'ERROR') {
        fs.appendFileSync(errorLogPath, logLine, 'utf8');
    }
};

const logger = {
    info: (msg) => writeLog('INFO', msg),
    success: (msg) => writeLog('SUCCESS', msg),
    warn: (msg) => writeLog('WARN', msg),
    error: (msg) => writeLog('ERROR', msg),
    hardware: (msg) => writeLog('HARDWARE', msg)
};

export default logger;
