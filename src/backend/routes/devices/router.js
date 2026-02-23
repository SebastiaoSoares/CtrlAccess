import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Dispositivos do banco de dados.' });
});

router.post('/', (req, res) => {
    const data = req.body;
    res.status(201).json({ 
        message: 'Dispositivo recebido com sucesso!', 
        payload: data 
    });
});

router.patch('/:id', (req, res) => {
    const deviceId = req.params.id;
    const data = req.body;
    res.json({ 
        message: `Dispositivo ${deviceId} atualizado com sucesso!`, 
        payload: data 
    });
});

router.delete('/:id', (req, res) => {
    const deviceId = req.params.id;
    res.json({ message: `Dispositivo ${deviceId} excluído com sucesso!` });
});

router.get('/:id/status', (req, res) => {
    const deviceId = req.params.id;
    res.json({ message: `Estado do dispositivo ${deviceId}.` });
});

router.post('/:id/open', (req, res) => {
    const deviceId = req.params.id;
    res.json({ message: `Comando de abertura enviado para o dispositivo ${deviceId}.` });
});

router.post('/:id/restart', (req, res) => {
    const deviceId = req.params.id;
    res.json({ message: `Comando de reinicialização enviado para o dispositivo ${deviceId}.` });
});

router.post('/:id/normal', (req, res) => {
    const deviceId = req.params.id;
    res.json({ message: `Modo Normal acionado no dispositivo ${deviceId}.` });
});

router.post('/:id/emergency', (req, res) => {
    const deviceId = req.params.id;
    res.json({ message: `Modo Aberto acionado no dispositivo ${deviceId}.` });
});

router.post('/:id/lockdown', (req, res) => {
    const deviceId = req.params.id;
    res.json({ message: `Modo Trancado acionado no dispositivo ${deviceId}.` });
});

export default router;
