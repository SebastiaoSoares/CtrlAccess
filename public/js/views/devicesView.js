import { fetchAPI } from '../services/api.js';
import { openModal } from '../components/modal.js';
import { socket } from '../services/sockets.js';

let currentDevices = [];

const formatMode = (mode) => {
    if (mode === 'emergencyMode') return 'Modo Liberado';
    if (mode === 'lockdownMode') return 'Modo Bloqueado';
    return 'Modo Normal';
};

export const renderDevices = (devices, filter = "") => {
    currentDevices = devices;
    const container = document.getElementById('devicesList');
    container.innerHTML = "";

    const filtered = currentDevices.filter(d => 
        d.name.toLowerCase().includes(filter.toLowerCase()) || 
        (d.sector_group || d.group).toLowerCase().includes(filter.toLowerCase()) ||
        d.ip.includes(filter)
    );

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; color: #94a3b8;">Nenhum dispositivo encontrado.</div>
        `;
        return;
    }

    filtered.forEach(device => {
        const isOffline = device.status === 'offline';
        const portPart = device.port ? `:${device.port}` : '';
        const displayAddress = `${device.ip}${portPart}`;
        const loginUrl = `http://${encodeURIComponent(device.username || device.user)}:${encodeURIComponent(device.password || device.pass)}@${device.ip}${portPart}`;
        const groupName = device.sector_group || device.group;

        const cardHTML = `
            <div class="device-card" id="dev-${device.id}">
                <div class="card-header">
                    <div class="device-info">
                        <h3>${device.name}</h3>
                        <span class="device-group">${groupName}</span>
                    </div>
                    <div class="header-actions">
                        <button class="btn-edit-icon" data-action="edit" data-id="${device.id}">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <div class="status-dot ${device.status}"></div>
                        <button class="btn-delete" data-action="delete" data-id="${device.id}">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <p>
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                        <a href="${loginUrl}" target="_blank" class="ip-link">${displayAddress}</a>
                    </p>
                    <p>
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span id="mode-text-${device.id}">${formatMode(device.mode)}</span>
                    </p>
                </div>
                <div class="card-actions">
                    <div class="btn-row">
                        <button class="btn btn-open" data-action="open" data-id="${device.id}" data-name="${device.name}" ${isOffline ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                            Abrir
                        </button>
                        <button class="btn btn-restart" data-action="restart" data-id="${device.id}" data-name="${device.name}" ${isOffline ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Reiniciar
                        </button>
                    </div>
                    <select class="mode-select" data-action="change-mode" data-id="${device.id}" ${isOffline ? 'disabled' : ''}>
                        <option value="normalMode" ${device.mode === 'normalMode' ? 'selected' : ''}>
                            Normal (Facial/Bio)
                        </option>
                        <option value="emergencyMode" ${device.mode === 'emergencyMode' ? 'selected' : ''}>
                            Liberar (Sempre Aberto)
                        </option>
                        <option value="lockdownMode" ${device.mode === 'lockdownMode' ? 'selected' : ''}>
                            Trancar (Bloqueio Total)
                        </option>
                    </select>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
};

export const setupDeviceEvents = () => {
    const container = document.getElementById('devicesList');

    container.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'delete') {
            if (confirm("Deseja remover este dispositivo?")) {
                await fetchAPI(`/devices/${id}`, { method: 'DELETE' });
                loadDevices();
            }
        } 
        else if (action === 'edit') {
            const deviceToEdit = currentDevices.find(d => d.id == id);
            if (deviceToEdit) openModal(deviceToEdit);
        }
        else if (action === 'open') {
            await fetchAPI(`/devices/${id}/open`, { method: 'POST' });
        }
        else if (action === 'restart') {
            await fetchAPI(`/devices/${id}/restart`, { method: 'POST' });
        }
    });

    container.addEventListener('change', async (e) => {
        if (e.target.dataset.action === 'change-mode') {
            const id = e.target.dataset.id;
            const newMode = e.target.value;

            const routeMap = {
                'normalMode': 'normal',
                'emergencyMode': 'emergency',
                'lockdownMode': 'lockdown'
            };

            e.target.disabled = true;

            try {
                await fetchAPI(`/devices/${id}/${routeMap[newMode]}`, { method: 'POST' });
                loadDevices();
            } catch (error) {
                alert("Falha ao comunicar com o equipamento.");
                loadDevices();
            }
        }
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        renderDevices(currentDevices, e.target.value);
    });

    socket.addEventListener('message', (event) => {
        try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'device_status' || message.type === 'device_status_changed') {
                const data = message.payload || message; 
                
                const statusDot = document.querySelector(`#dev-${data.id} .status-dot`);
                if (!statusDot) return;

                const btns = document.querySelectorAll(`#dev-${data.id} button.btn-open, #dev-${data.id} button.btn-restart, #dev-${data.id}`);
                const modeSelect = document.querySelector(`#dev-${data.id} .mode-select`);

                if (data.status === 'online') {
                    statusDot.classList.replace('offline', 'online');
                    statusDot.title = 'ONLINE';
                    
                    btns.forEach(btn => {
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        btn.style.cursor = 'pointer';
                    });
                    if(modeSelect) modeSelect.disabled = false;
                } else {
                    statusDot.classList.replace('online', 'offline');
                    statusDot.title = 'OFFLINE';
                    
                    btns.forEach(btn => {
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                        btn.style.cursor = 'not-allowed';
                    });
                    if(modeSelect) modeSelect.disabled = true;
                }
            }
        } catch (error) {}
    });
};

export const loadDevices = async () => {
    try {
        const devices = await fetchAPI('/devices');
        renderDevices(devices);
    } catch (error) {}
};
