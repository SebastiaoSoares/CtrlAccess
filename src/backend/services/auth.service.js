import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateUser = async (username, password) => {

    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminHash = process.env.ADMIN_PASS_HASH || await bcrypt.hash('admin', 10); 

    if (username !== adminUser) {
        throw new Error('Utilizador não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, adminHash);
    
    if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
        { username: adminUser, role: 'admin' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '8h' }
    );

    return token;
};
