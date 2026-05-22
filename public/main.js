import { loadDevices, setupDeviceEvents } from './js/views/devicesView.js';
import { setupModal } from './js/components/modal.js';
import { setupScheduleModal } from './js/components/scheduleModal.js';
import { loadSchedules, setupScheduleEvents } from './js/views/schedulesView.js';
import './js/views/comunicView.js';

export const customConfirm = (message) => {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const textElement = document.getElementById('confirmMessage');
        const btns = modal.querySelectorAll('.modal-actions .btn');
        const btnCancel = btns[0];
        const btnConfirm = btns[1];

        textElement.innerText = message;
        modal.style.display = 'flex';

        const closeAndResolve = (result) => {
            modal.style.display = 'none';
            btnCancel.removeEventListener('click', onCancel);
            btnConfirm.removeEventListener('click', onConfirm);
            resolve(result);
        };

        const onCancel = () => closeAndResolve(false);
        const onConfirm = () => closeAndResolve(true);

        btnCancel.addEventListener('click', onCancel);
        btnConfirm.addEventListener('click', onConfirm);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    console.log('Aplicação Frontend Inicializada!');
    
    const username = localStorage.getItem('username');
    const nameDisplay = document.getElementById('userNameDisplay');
    const btnLogout = document.getElementById('btnLogout');

    if (nameDisplay && username) {
        nameDisplay.innerText = username.toUpperCase();
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            const wantsToLogout = await customConfirm(`Deseja encerrar a sessão de ${username.toUpperCase()}?`);
            
            if (wantsToLogout) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = '/login.html';
            }
        });
        
        btnLogout.addEventListener('mouseenter', () => {
            btnLogout.style.background = '#ef4444';
            btnLogout.style.color = 'white';
        });
        btnLogout.addEventListener('mouseleave', () => {
            btnLogout.style.background = 'transparent';
            btnLogout.style.color = '#ef4444';
        });
    }
    
    setupDeviceEvents();
    setupScheduleModal();
    setupScheduleEvents(); 
    loadSchedules();
    setupModal();
    loadDevices();
});