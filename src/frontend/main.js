import './css/style.css'; 
import { loadDevices, setupDeviceEvents } from './js/views/devicesView.js';
import { setupModal } from './js/components/modal.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicação Frontend Inicializada com Vite!');
    
    setupDeviceEvents();
    setupModal();

    loadDevices();
});
