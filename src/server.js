import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initDB } from './config/database.js';
import * as deviceService from './services/device.service.js';
import * as controlidService from './services/controlid.service.js';
import logger from './utils/logger.js';
import { startCronJobs } from './services/cron.service.js';
import AmiClient from 'asterisk-manager';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
    logger.info(`Tela conectada ao Radar WebSocket: ${socket.id}`);
});

const asteriskIp = process.env.ASTERISK_IP; 
const asteriskUser = process.env.ASTERISK_USER;
const asteriskPass = process.env.ASTERISK_PASS;
const ami = new AmiClient(5038, asteriskIp, asteriskUser, asteriskPass, true);
ami.keepConnected();

ami.on('managerevent', async (evt) => {
    if (evt.event === 'Newstate' && (evt.channelstate === '4' || evt.channelstate === '5') && evt.exten === '9999') {
        
        const ipFacial = evt.calleridnum; 
        const ramalFacial = '1000';

        const catraca = await deviceService.getDeviceByIp(ipFacial); 
        
        const nomeCatraca = catraca ? catraca.name : `Equipamento Desconhecido (${ipFacial})`;

        logger.info(`[SIP] Chamada na Sala de Espera! Origem: ${nomeCatraca} (IP: ${ipFacial}). Avisando clientes...`);
        
        io.emit('nova_chamada_sip', {
            ip: ipFacial,
            ramal: ramalFacial,
            nome: nomeCatraca,
            mensagem: `Chamada de: ${nomeCatraca}`,
            timestamp: new Date()
        });
    }
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
