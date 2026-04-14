import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initDB } from './config/database.js';
import * as deviceService from './services/device.service.js';
import * as controlidService from './services/controlid.service.js';
import logger from './utils/logger.js';
import { startCronJobs } from './services/cron.service.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
    logger.info(`Tela conectada ao Radar WebSocket: ${socket.id}`);
});

const startHealthCheckWorker = () => {
    logger.info('Radar de Dispositivos ligado (Verificando a cada 10s)...');
    
    setInterval(async () => {
        const devices = deviceService.getAllDevices();
        
        await Promise.all(devices.map(async (device) => {
            const isOnline = await controlidService.pingDevice(device);
            const currentStatus = isOnline ? 'online' : 'offline';

            if (device.status !== currentStatus) {
                deviceService.updateDevice(device.id, { ...device, status: currentStatus });
                
                io.emit('device_status_changed', { 
                    id: device.id, 
                    status: currentStatus 
                });
                
                if (currentStatus === 'online') {
                    logger.success(`Status alterado: ${device.name} voltou a ficar ONLINE`);
                } else {
                    logger.warn(`Status alterado: ${device.name} caiu e está OFFLINE`);
                }
            }
        }));
    }, 10000);
};

initDB().then(() => {
    server.listen(PORT, () => {
        logger.success(`Servidor a correr na porta ${PORT}`);
        startHealthCheckWorker();
        startCronJobs();
    });
}).catch(err => {
    logger.error(`Erro fatal na BD: ${err.message}`);
});
