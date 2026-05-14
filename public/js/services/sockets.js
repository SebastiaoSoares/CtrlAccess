const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${wsProtocol}//${window.location.host}`;

export const socket = new WebSocket(wsUrl);

socket.onopen = () => {
    console.info('[INFO] WebSocket conectado ao servidor de automação.');
};

socket.onclose = () => {
    console.warn('[WARNING] Conexão WebSocket perdida. Tente recarregar a página.');
};

socket.onerror = (error) => {
    console.error('[ERROR] Erro de comunicação no WebSocket:', error);
};
