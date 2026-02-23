import { Router } from 'express';
import deviceRoutes from './devices/router.js';
import scheduleRoutes from './schedules/router.js';
import authRoutes from './auth/router.js';

const router = Router();

router.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'Online', 
        message: 'API do CtrlAccess operando normalmente.' 
    });
});

router.use('/devices', deviceRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/auth', authRoutes);

export default router;