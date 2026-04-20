import { authenticateUser } from '../services/auth.service.js';
import logger from '../utils/logger.js';

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            logger.warn(`Tentativa de login falhada: Campos em falta. IP: ${req.ip}`);
            return res.status(400).json({ message: 'Utilizador e palavra-passe são obrigatórios.' });
        }

        logger.info(`A iniciar tentativa de login para o utilizador: ${username}`);

        const token = await authenticateUser(username, password);

        logger.success(`Login bem-sucedido: ${username} entrou no sistema.`);

        res.status(200).json({
            message: 'Login bem-sucedido',
            token: token
        });
    } catch (error) {
        const attemptedUser = req.body?.username || 'Desconhecido';
        
        logger.error(`Falha no login (${attemptedUser}): ${error.message}`);
        res.status(401).json({ message: error.message });
    }
};
