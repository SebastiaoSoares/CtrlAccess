import { fetchAPI } from '../services/api.js';
import { loadSchedules } from '../views/schedulesView.js';

let modal, form, title, btnSave;
export let selectedDays = [];

const showNotification = (message, isError = false) => {
    let toast = document.getElementById('toastNotification');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        document.body.appendChild(toast);
    }

    const icon = isError 
        ? '<ion-icon name="alert-circle-outline" style="font-size: 1.4rem;"></ion-icon>' 
        : '<ion-icon name="checkmark-circle-outline" style="font-size: 1.4rem;"></ion-icon>';

    toast.innerHTML = `<div style="display: flex; align-items: center; justify-content: center;">${icon}</div> <span>${message}</span>`;
    
    toast.className = `toast show ${isError ? 'error' : 'success'}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
};

export const setupScheduleModal = () => {
    modal = document.getElementById('scheduleModal');
    form = document.getElementById('scheduleForm');
    title = document.getElementById('scheduleModalTitle');
    btnSave = document.getElementById('btnSaveSchedule');
    
    const btnAdd = document.getElementById('btnAddSchedule');

    if (btnAdd && modal) {
        btnAdd.addEventListener('click', () => openScheduleModal(null));
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('close-sched-btn')) {
            modal.style.display = 'none';
        }
    });

    const dayBtns = document.querySelectorAll('.day-btn');
    dayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const day = parseInt(btn.dataset.day);
            if (selectedDays.includes(day)) {
                selectedDays = selectedDays.filter(d => d !== day);
                btn.classList.remove('active');
            } else {
                selectedDays.push(day);
                btn.classList.add('active');
            }
            selectedDays.sort();
        });
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            if (selectedDays.length === 0) {
                showNotification("Selecione pelo menos um dia da semana!", true);
                return;
            }

            const originalText = btnSave.innerText;
            btnSave.innerText = "A guardar...";
            btnSave.disabled = true;

            const id = document.getElementById('editScheduleId').value;
            const ruleData = {
                title: document.getElementById('newRuleTitle').value,
                group_target: document.getElementById('newRuleGroupSelect').value,
                time_start: document.getElementById('newRuleTimeStart').value,
                time_end: document.getElementById('newRuleTimeEnd').value,
                days: selectedDays,
                mode: document.getElementById('newRuleMode').value
            };

            try {
                const url = id ? `/schedules/${id}` : '/schedules';
                const method = id ? 'PATCH' : 'POST';

                await fetchAPI(url, { 
                    method: method, 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ruleData) 
                });

                showNotification("Agendamento salvo com sucesso!", false);
                modal.style.display = 'none';
                loadSchedules();

            } catch (error) {
                console.error("Erro da API:", error);
                showNotification("Falha de comunicação com o servidor.", true);
            } finally {
                btnSave.innerText = originalText;
                btnSave.disabled = false;
            }
        });
    }
};

export const openScheduleModal = async (sched = null) => {
    modal.style.display = 'flex'; 

    form.reset();
    document.getElementById('editScheduleId').value = '';
    selectedDays = [];
    document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));

    const selectGroup = document.getElementById('newRuleGroupSelect');
    selectGroup.innerHTML = '<option value="" disabled selected>A carregar grupos...</option>';
    
    try {
        const devices = await fetchAPI('/devices');
        const groups = [...new Set(devices.map(d => d.sector_group || d.group).filter(Boolean))];
        
        let optionsHtml = `<option value="" disabled selected>Selecione um grupo alvo</option>`;
        optionsHtml += `<option value="Todos">Todos os Dispositivos</option>`;
        groups.forEach(g => { optionsHtml += `<option value="${g}">${g}</option>`; });
        selectGroup.innerHTML = optionsHtml;
    } catch (error) {
        selectGroup.innerHTML = `<option value="Todos">Todos os Dispositivos</option>`;
    }

    if (sched) {
        title.innerText = "Editar Regra";
        btnSave.innerText = "Atualizar";
        document.getElementById('editScheduleId').value = sched.id;
        document.getElementById('newRuleTitle').value = sched.title;
        document.getElementById('newRuleTimeStart').value = sched.time_start;
        document.getElementById('newRuleTimeEnd').value = sched.time_end;
        document.getElementById('newRuleMode').value = sched.mode;
        
        setTimeout(() => { document.getElementById('newRuleGroupSelect').value = sched.group_target; }, 50);

        const daysArray = typeof sched.days === 'string' ? JSON.parse(sched.days) : sched.days;
        selectedDays = [...daysArray];
        document.querySelectorAll('.day-btn').forEach(btn => {
            if (selectedDays.includes(parseInt(btn.dataset.day))) btn.classList.add('active');
        });
    } else {
        title.innerText = "Adicionar Nova Regra";
        btnSave.innerText = "Salvar";
    }
};
