import { authenticateUser } from '../services/auth.service.js';

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Utilizador e palavra-passe são obrigatórios.' });
        }

        const token = await authenticateUser(username, password);

        res.status(200).json({
            message: 'Login bem-sucedido',
            token: token
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};
