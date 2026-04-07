import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import db from '../config/database.js';

dotenv.config();

export const authenticateUser = async (username, password) => {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
        throw new Error('Utilizador não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role }, 
        process.env.JWT_SECRET || 'chave_secreta_padrao', 
        { expiresIn: '8h' }
    );

    return token;
};
