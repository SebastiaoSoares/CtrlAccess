import './css/style.css'; 
import { loadDevices, setupDeviceEvents } from './js/views/devicesView.js';
import { setupModal } from './js/components/modal.js';
import { setupScheduleModal } from './js/components/scheduleModal.js';
import { loadSchedules } from './js/views/schedulesView.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicação Frontend Inicializada com Vite!');
    
    setupDeviceEvents();
    setupScheduleModal();
    loadSchedules();

    setupModal();

    loadDevices();
});
