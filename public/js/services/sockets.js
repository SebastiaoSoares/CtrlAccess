import { io } from 'socket.io-client';

export const socket = io('http://localhost:5001');

socket.on('connect', () => {
    console.log('Conectado ao Radar WebSocket com sucesso!');
});
