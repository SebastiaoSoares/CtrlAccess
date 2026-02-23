import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Agendamentos do banco de dados.' });
});

router.post('/', (req, res) => {
    const data = req.body;
    res.status(201).json({ 
        message: 'Agendamento recebido com sucesso!', 
        payload: data 
    });
});

router.patch('/:id', (req, res) => {
    const scheduleId = req.params.id;
    const data = req.body;
    res.json({ 
        message: `Agendamento ${scheduleId} atualizado com sucesso!`, 
        payload: data 
    });
});

router.delete('/:id', (req, res) => {
    const scheduleId = req.params.id;
    res.json({ message: `Agendamento ${scheduleId} excluído com sucesso!` });
});

export default router;