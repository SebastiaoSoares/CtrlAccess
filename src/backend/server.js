import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initDB } from './config/database.js';
import * as deviceService from './services/device.service.js';
import * as controlidService from './services/controlid.service.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
    console.log(`Tela conectada ao Radar WebSocket: ${socket.id}`);
});

const startHealthCheckWorker = () => {
    console.log('Radar de Dispositivos ligado (Verificando a cada 10s)...');
    
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
                
                console.log(`Status alterado: ${device.name} mudou para ${currentStatus.toUpperCase()}`);
            }
        }));
    }, 10000);
};

initDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Servidor a correr na porta ${PORT}`);
        startHealthCheckWorker();
    });
}).catch(err => console.error('❌ Erro na BD:', err));
