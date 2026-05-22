import { criarModalChamada } from '../views/comunicView.js';

export const socket = io();

socket.addEventListener = function(eventName, callback) {
    if (eventName === 'message') {
        socket.on('device_status_changed', (payload) => {
            callback({ data: JSON.stringify({ type: 'device_status_changed', payload }) });
        });
        
        socket.on('nova_chamada_sip', (payload) => {
            callback({ data: JSON.stringify({ type: 'nova_chamada_sip', payload }) });
        });
    }
};

socket.on('connect', () => {
    console.log('[WebSocket] Conectado ao Backend Node.js com sucesso!');
});

socket.on('connect_error', (err) => {
    console.error('[WebSocket] Erro de conexão com o servidor:', err.message);
});

socket.on('nova_chamada_sip', (data) => {
    console.log('[WebSocket] Notificação de chamada recebida do Node.js:', data);
    criarModalChamada(data);
});
