// src/frontend/js/components/modal.js
import { fetchAPI } from '../services/api.js';
import { loadDevices } from '../views/devicesView.js';

let modal, form, title, idInput;

export const setupModal = () => {
    modal = document.getElementById('deviceModal');
    const btnAdd = document.getElementById('btnAddDevice');
    form = document.getElementById('deviceForm');
    title = document.getElementById('deviceModalTitle');
    idInput = document.getElementById('editDeviceId');

    if (btnAdd && modal) {
        btnAdd.addEventListener('click', () => {
            openModal();
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('close-btn')) {
            modal.style.display = 'none';
        }
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const deviceId = formData.get('id');

            const deviceData = {
                name: formData.get('name'),
                sector_group: formData.get('group'),
                ip: formData.get('ip'),
                port: formData.get('port') || '80',
                username: formData.get('user'),
                password: formData.get('pass')
            };

            try {
                if (deviceId) {
                    await fetchAPI(`/devices/${deviceId}`, {
                        method: 'PATCH',
                        body: JSON.stringify(deviceData)
                    });
                } else {
                    await fetchAPI('/devices', {
                        method: 'POST',
                        body: JSON.stringify(deviceData)
                    });
                }

                modal.style.display = 'none';
                form.reset();
                loadDevices(); 
                
            } catch (error) {
                console.error("Erro ao salvar dispositivo:", error);
                alert("Erro ao salvar o dispositivo. Verifique a consola.");
            }
        });
    }
};

export const openModal = (device = null) => {
    form.reset();
    
    if (device) {
        title.textContent = 'Editar Dispositivo';
        idInput.value = device.id;
        
        form.elements['name'].value = device.name;
        form.elements['group'].value = device.sector_group || device.group;
        form.elements['ip'].value = device.ip;
        form.elements['port'].value = device.port || '';
        form.elements['user'].value = device.username || device.user;
        form.elements['pass'].value = device.password || device.pass;
    } else {
        title.textContent = 'Novo Dispositivo Facial';
        idInput.value = '';
    }
    
    modal.style.display = 'flex';
};
