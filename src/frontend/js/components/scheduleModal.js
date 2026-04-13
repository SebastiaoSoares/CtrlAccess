// src/frontend/js/components/scheduleModal.js
import { fetchAPI } from '../services/api.js';
import { loadSchedules } from '../views/schedulesView.js';

let modal, form, title, btnSave;
export let selectedDays = [];

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
                return alert("Por favor, selecione pelo menos um dia da semana!");
            }

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
                if (id) {
                    await fetchAPI(`/schedules/${id}`, { method: 'PATCH', body: JSON.stringify(ruleData) });
                } else {
                    await fetchAPI('/schedules', { method: 'POST', body: JSON.stringify(ruleData) });
                }

                modal.style.display = 'none';
                loadSchedules();
            } catch (error) {
                console.error("Erro ao salvar regra:", error);
                alert("Erro ao salvar regra.");
            }
        });
    }
};

export const openScheduleModal = (sched = null) => {
    form.reset();
    document.getElementById('editScheduleId').value = '';
    selectedDays = [];

    document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));

    if (sched) {
        title.innerText = "Editar Regra";
        btnSave.innerText = "Atualizar";
        document.getElementById('editScheduleId').value = sched.id;
        document.getElementById('newRuleTitle').value = sched.title;
        document.getElementById('newRuleTimeStart').value = sched.time_start;
        document.getElementById('newRuleTimeEnd').value = sched.time_end;
        document.getElementById('newRuleMode').value = sched.mode;
        
        setTimeout(() => { document.getElementById('newRuleGroupSelect').value = sched.group_target; }, 100);

        const daysArray = typeof sched.days === 'string' ? JSON.parse(sched.days) : sched.days;
        selectedDays = [...daysArray];
        document.querySelectorAll('.day-btn').forEach(btn => {
            if (selectedDays.includes(parseInt(btn.dataset.day))) btn.classList.add('active');
        });
    } else {
        title.innerText = "Adicionar Nova Regra";
        btnSave.innerText = "Salvar";
    }
    
    modal.style.display = 'flex';
};
