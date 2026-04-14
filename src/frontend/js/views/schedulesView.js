import { fetchAPI } from '../services/api.js';
import { openScheduleModal } from '../components/scheduleModal.js';

let currentSchedules = [];

const formatDays = (daysArray) => {
    if (!daysArray || daysArray.length === 0) return "NENHUM DIA";
    
    const parsedDays = typeof daysArray === 'string' ? JSON.parse(daysArray) : daysArray;
    
    if (parsedDays.length === 7) return "TODOS OS DIAS";
    
    const map = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    const isWeekDays = parsedDays.length === 5 && !parsedDays.includes(0) && !parsedDays.includes(6);
    
    if (isWeekDays) return "SEG A SEX";
    return parsedDays.map(d => map[d]).join(', ');
};

export const renderSchedules = (schedules, filter = "") => {
    const container = document.getElementById('schedulesList');
    if (!container) return;
    container.innerHTML = "";
    
    const filtered = schedules.filter(s => 
        s.title.toLowerCase().includes(filter.toLowerCase()) || 
        s.group_target.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        container.innerHTML = `<div style="padding: 2rem; color: #94a3b8;">Nenhum agendamento encontrado.</div>`;
        return;
    }
    
    filtered.forEach(item => {
        let tagClass = 'tag-normal';
        let tagText = '<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> NORMAL';
        
        if (item.mode === 'emergencyMode') { 
            tagClass = 'tag-emergency'; 
            tagText = '<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg> LIBERADO'; 
        }
        if (item.mode === 'lockdownMode') { 
            tagClass = 'tag-lockdown'; 
            tagText = '<svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> TRANCADO'; 
        }

        const html = /*html*/`
            <div class="schedule-item">
                <div class="sched-header">
                    <span class="sched-title">${item.title}</span>
                    <span class="sched-group-badge">${item.group_target}</span>
                </div>
                <button class="btn-edit-sched" data-action="edit" data-id="${item.id}" title="Editar">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <div class="sched-time">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ${item.time_start} - ${item.time_end}
                </div>
                <div class="sched-days">${formatDays(item.days)}</div>
                <span class="sched-tag ${tagClass}">${tagText}</span>
                <button class="btn-delete" data-action="delete" data-id="${item.id}" title="Remover">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
        container.innerHTML += html;
    });
};

export const setupScheduleEvents = () => {
    const container = document.getElementById('schedulesList');
    const btnToggle = document.getElementById('btnToggleAutomation');
    const statusText = document.getElementById('automationStatusText');

    fetchAPI('/schedules/status').then(res => updateToggleUI(res.active));

    if (btnToggle) {
        btnToggle.addEventListener('click', async () => {
            const originalText = statusText.innerText;
            statusText.innerText = "Aguarde...";
            try {
                const res = await fetchAPI('/schedules/toggle', { method: 'POST' });
                updateToggleUI(res.active);
            } catch (e) {
                statusText.innerText = originalText;
                alert("Falha ao contactar o servidor!");
            }
        });
    }

    function updateToggleUI(isActive) {
        if (isActive) {
            btnToggle.style.background = '#10b981'; // Verde
            statusText.innerText = "Ativa";
        } else {
            btnToggle.style.background = '#ef4444'; // Vermelho
            statusText.innerText = "Pausada";
        }
    }

    container.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'delete') {
            if (confirm("Deseja remover este agendamento?")) {
                await fetchAPI(`/schedules/${id}`, { method: 'DELETE' });
                loadSchedules();
            }
        } 
        else if (action === 'edit') {
            const scheduleToEdit = currentSchedules.find(s => s.id == id);
            
            if (scheduleToEdit) {
                openScheduleModal(scheduleToEdit);
            }
        }
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        renderSchedules(currentSchedules, e.target.value);
    });
};

export const loadSchedules = async () => {
    try {
        const schedules = await fetchAPI('/schedules');
        renderSchedules(schedules, "");
    } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
    }
};
