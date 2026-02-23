import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
    const data = req.body;
    res.status(200).json({
        message: 'Login bem-sucedido',
        playload: data.username
    });
});

export default router;