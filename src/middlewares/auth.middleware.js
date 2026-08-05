// src/backend/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn(`Bloqueio de segurança: Token não fornecido. IP: ${req.ip} | Rota: ${req.originalUrl}`);
        return res.status(403).json({ message: 'Token de autenticação não fornecido. Acesso negado.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            logger.error(`Token rejeitado (${err.message}). IP: ${req.ip} | Rota: ${req.originalUrl}`);
            return res.status(401).json({ message: 'Token inválido ou expirado.' });
        }
        
        req.user = decoded;
        next();
    });
};
