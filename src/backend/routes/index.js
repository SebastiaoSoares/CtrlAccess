import { Router } from 'express';
import deviceRoutes from './devices/router.js';
import scheduleRoutes from './schedules/router.js';
import authRoutes from './auth/router.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'Online', 
        message: 'API do CtrlAccess operando.' 
    });
});

router.use('/auth', authRoutes);
router.use('/devices', verifyToken, deviceRoutes);
router.use('/schedules', verifyToken, scheduleRoutes);

export default router;
