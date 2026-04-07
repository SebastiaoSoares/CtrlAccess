import app from './app.js';
import { initDB } from './config/database.js';

const PORT = process.env.PORT || 3000;

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor a correr na porta ${PORT}`);
    });
}).catch(err => {
    console.error('Erro ao inicializar a base de dados:', err);
});
