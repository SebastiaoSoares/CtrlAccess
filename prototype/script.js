let devices = [];
let schedules = [];
let pendingAction = null;
let pendingDeviceId = null;
let selectedDays = [];

async function loadData() {
    try {
        const response = await fetch('./mocks.json');
        if (!response.ok) throw new Error('Failed to load mocks');
        const data = await response.json();
        devices = data.devices || [];
        schedules = data.schedules || [];
        
        populateGroupSelects();
        renderDevices();
        renderSchedules();
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

function getUniqueGroups() {
    const groups = new Set(devices.map(d => d.group));
    return Array.from(groups).sort();
}

function populateGroupSelects() {
    const groups = getUniqueGroups();
    const deviceSelect = document.getElementById('newDeviceGroupSelect');
    
    let deviceOptions = `<option value="" disabled selected>Selecione um grupo</option>`;
    groups.forEach(g => deviceOptions += `<option value="${g}">${g}</option>`);
    deviceOptions += `<option value="NEW_GROUP">➕ Criar Novo Grupo</option>`;
    deviceSelect.innerHTML = deviceOptions;

    const ruleSelect = document.getElementById('newRuleGroupSelect');
    let ruleOptions = `<option value="" disabled selected>Selecione o grupo alvo</option>`;
    groups.forEach(g => ruleOptions += `<option value="${g}">${g}</option>`);
    ruleSelect.innerHTML = ruleOptions;
}

function maskIP(el) {
    let val = el.value.replace(/[^0-9.]/g, ''); 
    el.value = val;
}

function toggleGroupInput(value) {
    const input = document.getElementById('newDeviceGroupInput');
    if(value === 'NEW_GROUP') {
        input.classList.remove('hidden');
        input.focus();
    } else {
        input.classList.add('hidden');
        input.value = '';
    }
}

function renderDevices(filter = "") {
    const container = document.getElementById('devicesList');
    container.innerHTML = "";

    const filtered = devices.filter(d => 
        d.name.toLowerCase().includes(filter.toLowerCase()) || 
        d.group.toLowerCase().includes(filter.toLowerCase()) ||
        d.ip.includes(filter)
    );

    if (filtered.length === 0) {
        container.innerHTML = `<div style="padding: 2rem; color: #94a3b8;">Nenhum dispositivo encontrado.</div>`;
        return;
    }

    filtered.forEach(device => {
        const isOffline = device.status === 'offline';
        const portPart = device.port ? `:${device.port}` : '';
        const displayAddress = `${device.ip}${portPart}`;
        const loginUrl = `http://${encodeURIComponent(device.user)}:${encodeURIComponent(device.pass)}@${device.ip}${portPart}`;

        const cardHTML = `
            <div class="device-card" id="dev-${device.id}">
                <div class="card-header">
                    <div class="device-info">
                        <h3>${device.name}</h3>
                        <span class="device-group">${device.group}</span>
                    </div>
                    <div class="header-actions">
                        <button class="btn-edit-icon" onclick="openDeviceModal(${device.id})" title="Editar">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <div class="status-dot ${device.status}" title="${device.status.toUpperCase()}"></div>
                    </div>
                </div>
                <div class="card-body">
                    <p>
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                        <a href="${loginUrl}" target="_blank" class="ip-link" title="Login: ${device.user}">${displayAddress}</a>
                    </p>
                    <p>
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span id="mode-text-${device.id}">${formatMode(device.mode)}</span>
                    </p>
                </div>
                <div class="card-actions">
                    <div class="btn-row">
                        <button class="btn btn-open" onclick="openConfirmModal('open', ${device.id}, '${device.name}')" ${isOffline ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                            Abrir
                        </button>
                        <button class="btn btn-restart" onclick="openConfirmModal('restart', ${device.id}, '${device.name}')" ${isOffline ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Reiniciar
                        </button>
                    </div>
                    <select class="mode-select" onchange="changeMode(${device.id}, this.value)" ${isOffline ? 'disabled' : ''}>
                        <option value="normalMode" ${device.mode === 'normalMode' ? 'selected' : ''}>⚙️ Normal (Facial/Bio)</option>
                        <option value="emergencyMode" ${device.mode === 'emergencyMode' ? 'selected' : ''}>🟢 Liberar (Sempre Aberto)</option>
                        <option value="lockdownMode" ${device.mode === 'lockdownMode' ? 'selected' : ''}>🔴 Trancar (Bloqueio Total)</option>
                    </select>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function formatDays(daysArray) {
    if(daysArray.length === 7) return "TODOS OS DIAS";
    if(daysArray.length === 0) return "NENHUM DIA";
    const map = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    const isWeekDays = daysArray.length === 5 && !daysArray.includes(0) && !daysArray.includes(6);
    if(isWeekDays) return "SEG A SEX";
    return daysArray.map(d => map[d]).join(', ');
}

function renderSchedules() {
    const container = document.getElementById('schedulesList');
    container.innerHTML = "";
    
    schedules.forEach(item => {
        let tagClass = 'tag-normal';
        let tagText = 'NORMAL';
        if(item.mode === 'emergencyMode') { tagClass = 'tag-emergency'; tagText = 'LIBERADO'; }
        if(item.mode === 'lockdownMode') { tagClass = 'tag-lockdown'; tagText = 'TRANCADO'; }

        const html = `
            <div class="schedule-item">
                <div class="sched-header">
                    <span class="sched-title">${item.title}</span>
                    <span class="sched-group-badge">${item.group}</span>
                </div>
                <button class="btn-edit-sched" onclick="openScheduleModal(${item.id})">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <div class="sched-time">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ${item.time}
                </div>
                <div class="sched-days">${formatDays(item.days)}</div>
                <span class="sched-tag ${tagClass}">${tagText}</span>
                <button class="btn-delete" onclick="deleteSchedule(${item.id})">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
        container.innerHTML += html;
    });
}

function formatMode(mode) {
    if (mode === 'emergencyMode') return 'Modo Liberado';
    if (mode === 'lockdownMode') return 'Modo Bloqueado';
    return 'Modo Normal';
}

function initDaySelector() {
    const btns = document.querySelectorAll('.day-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const day = parseInt(btn.dataset.day);
            if(selectedDays.includes(day)) {
                selectedDays = selectedDays.filter(d => d !== day);
                btn.classList.remove('active');
            } else {
                selectedDays.push(day);
                btn.classList.add('active');
            }
            selectedDays.sort();
        });
    });
}

function setDaySelector(daysArray) {
    selectedDays = [...daysArray];
    document.querySelectorAll('.day-btn').forEach(btn => {
        const day = parseInt(btn.dataset.day);
        if(selectedDays.includes(day)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function openConfirmModal(action, id, deviceName) {
    pendingAction = action;
    pendingDeviceId = id;
    const modal = document.getElementById('confirmModal');
    const msg = document.getElementById('confirmMessage');

    if(action === 'open') {
        msg.innerHTML = `Tem certeza que deseja <b>ABRIR</b> a porta de <br><b>${deviceName}</b>?`;
    } else if (action === 'restart') {
        msg.innerHTML = `Tem certeza que deseja <b>REINICIAR</b> o dispositivo <br><b>${deviceName}</b>?`;
    }

    modal.classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    pendingAction = null;
    pendingDeviceId = null;
}

function executeAction() {
    if(!pendingAction || !pendingDeviceId) return;

    if(pendingAction === 'open') {
        alert(`[API] Enviando comando ABRIR PORTA para ID ${pendingDeviceId}`);
    } else if (pendingAction === 'restart') {
        alert(`[API] Enviando comando REBOOT para ID ${pendingDeviceId}`);
    }

    closeConfirmModal();
}

function openDeviceModal(deviceId = null) {
    populateGroupSelects();
    const modal = document.getElementById('deviceModal');
    const title = document.getElementById('deviceModalTitle');
    const btn = modal.querySelector('.modal-actions button:last-child');
    
    document.getElementById('editDeviceId').value = '';
    document.getElementById('newDeviceName').value = '';
    document.getElementById('newDeviceGroupSelect').value = '';
    toggleGroupInput(''); 
    document.getElementById('newDeviceIp').value = '';
    document.getElementById('newDevicePort').value = '';
    document.getElementById('newDeviceUser').value = '';
    document.getElementById('newDevicePass').value = '';

    if (deviceId) {
        const dev = devices.find(d => d.id === deviceId);
        title.innerText = "Editar Dispositivo";
        btn.innerText = "Atualizar";
        document.getElementById('editDeviceId').value = dev.id;
        document.getElementById('newDeviceName').value = dev.name;
        document.getElementById('newDeviceGroupSelect').value = dev.group;
        document.getElementById('newDeviceIp').value = dev.ip;
        document.getElementById('newDevicePort').value = dev.port || '';
        document.getElementById('newDeviceUser').value = dev.user;
        document.getElementById('newDevicePass').value = dev.pass;
    } else {
        title.innerText = "Novo Dispositivo Facial";
        btn.innerText = "Cadastrar";
    }
    modal.classList.add('active');
}

function closeDeviceModal() {
    document.getElementById('deviceModal').classList.remove('active');
}

function saveDevice() {
    const id = document.getElementById('editDeviceId').value;
    const name = document.getElementById('newDeviceName').value;
    let group = document.getElementById('newDeviceGroupSelect').value;
    const groupInput = document.getElementById('newDeviceGroupInput').value;
    const ip = document.getElementById('newDeviceIp').value;
    const port = document.getElementById('newDevicePort').value;
    const user = document.getElementById('newDeviceUser').value;
    const pass = document.getElementById('newDevicePass').value;

    if(group === 'NEW_GROUP') group = groupInput;

    if(!name || !group || !ip || !user || !pass) return alert("Preencha todos os campos!");

    if (id) {
        const index = devices.findIndex(d => d.id == id);
        if (index > -1) {
            devices[index] = { ...devices[index], name, group, ip, port, user, pass };
        }
    } else {
        devices.push({ id: Date.now(), name, group, ip, port, user, pass, status: 'online', mode: 'normalMode' });
    }

    renderDevices();
    closeDeviceModal();
}

function openScheduleModal(scheduleId = null) {
    populateGroupSelects();
    const modal = document.getElementById('scheduleModal');
    const title = document.getElementById('scheduleModalTitle');
    const btn = modal.querySelector('.modal-actions button:last-child');

    document.getElementById('editScheduleId').value = '';
    document.getElementById('newRuleTitle').value = '';
    document.getElementById('newRuleGroupSelect').value = '';
    document.getElementById('newRuleTimeStart').value = '';
    document.getElementById('newRuleTimeEnd').value = '';
    selectedDays = [];
    setDaySelector([]);

    if(scheduleId) {
        const sched = schedules.find(s => s.id === scheduleId);
        title.innerText = "Editar Regra";
        btn.innerText = "Atualizar";
        document.getElementById('editScheduleId').value = sched.id;
        document.getElementById('newRuleTitle').value = sched.title;
        document.getElementById('newRuleGroupSelect').value = sched.group;
        
        const times = sched.time.split(' - ');
        if(times.length === 2) {
            document.getElementById('newRuleTimeStart').value = times[0];
            document.getElementById('newRuleTimeEnd').value = times[1];
        }

        document.getElementById('newRuleMode').value = sched.mode;
        setDaySelector(sched.days);
    } else {
        title.innerText = "Adicionar Nova Regra";
        btn.innerText = "Salvar";
    }
    modal.classList.add('active');
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('active');
}

function saveSchedule() {
    const id = document.getElementById('editScheduleId').value;
    const title = document.getElementById('newRuleTitle').value;
    const group = document.getElementById('newRuleGroupSelect').value;
    const start = document.getElementById('newRuleTimeStart').value;
    const end = document.getElementById('newRuleTimeEnd').value;
    const mode = document.getElementById('newRuleMode').value;

    if(!title || !group || !start || !end || selectedDays.length === 0) {
        return alert("Preencha todos os campos e selecione os dias!");
    }

    const timeString = `${start} - ${end}`;

    if(id) {
        const index = schedules.findIndex(s => s.id == id);
        if(index > -1) {
            schedules[index] = { ...schedules[index], title, group, time: timeString, mode, days: [...selectedDays] };
        }
    } else {
        schedules.push({ id: Date.now(), title, group, time: timeString, mode, days: [...selectedDays] });
    }

    renderSchedules();
    closeScheduleModal();
}

function deleteSchedule(id) {
    if(confirm("Deseja remover esta regra?")) {
        schedules = schedules.filter(s => s.id !== id);
        renderSchedules();
    }
}

function changeMode(id, mode) {
    const d = devices.find(d => d.id === id);
    if(d) d.mode = mode;
    renderDevices(document.getElementById('searchInput').value);
}

function setupScrollMask() {
    const wrapper = document.querySelector('.devices-wrapper');
    const updateMask = () => {
        const tolerance = 2;
        const isAtStart = wrapper.scrollLeft <= tolerance;
        const maxScrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
        const isAtEnd = wrapper.scrollLeft >= maxScrollLeft - tolerance;
        wrapper.style.setProperty('--mask-start-opacity', isAtStart ? '100%' : '0%');
        wrapper.style.setProperty('--mask-end-opacity', isAtEnd ? '100%' : '0%');
    };
    wrapper.addEventListener('scroll', updateMask);
    window.addEventListener('resize', updateMask);
    setTimeout(updateMask, 100);
}

document.getElementById('searchInput').addEventListener('input', (e) => renderDevices(e.target.value));
initDaySelector();
setupScrollMask();
loadData();