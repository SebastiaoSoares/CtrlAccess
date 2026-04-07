// src/backend/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import apiRoutes from './routes/index.js'; 

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
    message: { message: 'Demasiados pedidos a partir deste IP, por favor tente novamente após 15 minutos.' }
});

app.use('/api', limiter);

app.use(morgan('dev'));

app.use(express.json());

app.use('/api', apiRoutes);

export default app;
