import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import apiRoutes from './routes/index.js'; 
import logger from './utils/logger.js';

const app = express();

app.use(helmet());

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Demasiados pedidos a partir deste IP, por favor tente novamente após 15 minutos.' },
    handler: (req, res, next, options) => {
        logger.warn(`Bloqueio por Rate Limit: O IP ${req.ip} excedeu o limite de requisições.`);
        res.status(options.statusCode).json(options.message);
    }
});

app.use('/api', limiter);

app.use(morgan('dev', {
    stream: { write: (message) => logger.info(`[HTTP] ${message.trim()}`) }
}));

app.use(express.json());

app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
    logger.error(`Erro Fatal Não Tratado: ${err.message} | Rota: ${req.originalUrl}`);
    res.status(500).json({ message: 'Erro interno crítico do servidor.' });
});

export default app;
