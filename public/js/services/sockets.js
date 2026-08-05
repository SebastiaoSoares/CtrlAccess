export const socket = io();

socket.addEventListener = function(eventName, callback) {
    if (eventName === 'message') {
        socket.on('device_status_changed', (payload) => {
            callback({ data: JSON.stringify({ type: 'device_status_changed', payload }) });
        });
    }
};

socket.on('connect', () => {
    console.log('[WebSocket] Conectado ao Backend Node.js com sucesso!');
});

socket.on('connect_error', (err) => {
    console.error('[WebSocket] Erro de conexão com o servidor:', err.message);
});
