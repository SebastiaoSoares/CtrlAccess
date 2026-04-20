import cron from 'node-cron';
import logger from '../utils/logger.js';
import * as scheduleService from './schedule.service.js';
import * as deviceService from './device.service.js';
import * as controlidService from './controlid.service.js';

let cronTask = null;
let isAutomationActive = true;

export const getCronStatus = () => ({ active: isAutomationActive });

export const toggleCron = () => {
    isAutomationActive = !isAutomationActive;
    if (isAutomationActive) {
        logger.success('Motor Cron RETOMADO pelo painel de controlo.');
    } else {
        logger.warn('Motor Cron PAUSADO. As portas não vão abrir/fechar sozinhas.');
    }
    return { active: isAutomationActive };
};

export const startCronJobs = () => {
    if (cronTask) cronTask.stop();

    logger.info('Motor Cron (Automação Inteligente) a iniciar...');

    cronTask = cron.schedule('* * * * *', async () => {
        if (!isAutomationActive) return; 

        const now = new Date();
        const currentHourMin = now.toLocaleTimeString('pt-BR', { 
            timeZone: 'America/Fortaleza', hour: '2-digit', minute: '2-digit' 
        });
        const currentDay = now.getDay();

        try {
            const schedules = scheduleService.getAllSchedules();
            const allDevices = deviceService.getAllDevices();

            for (const device of allDevices) {
                if (device.status === 'offline') continue;

                let expectedMode = 'normalMode'; 
                let activeScheduleTitle = null;

                for (const sched of schedules) {
                    let daysArray = [];
                    try { daysArray = typeof sched.days === 'string' ? JSON.parse(sched.days) : sched.days; } 
                    catch (e) { continue; }

                    if (!daysArray.includes(currentDay)) continue;
                    if (sched.group_target !== 'Todos' && sched.group_target !== device.sector_group && sched.group_target !== device.group) continue;

                    if (currentHourMin >= sched.time_start && currentHourMin < sched.time_end) {
                        expectedMode = sched.mode;
                        activeScheduleTitle = sched.title;
                        break; 
                    }
                }

                if (device.mode !== expectedMode) {
                    const motivo = expectedMode === 'normalMode' ? '(Fim de Regra ou Sem Regra)' : `(Regra: ${activeScheduleTitle})`;
                    logger.info(`[CRON] Ajustando estado de ${device.name} para ${expectedMode.toUpperCase()} ${motivo}`);
                    
                    try {
                        await controlidService.setMode(device, expectedMode);
                        deviceService.updateDevice(device.id, { ...device, mode: expectedMode });
                    } catch (error) {
                        logger.error(`[CRON] Falha ao ajustar ${device.name}: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            logger.error(`Erro no Motor Cron: ${error.message}`);
        }
    });

    logger.success('Motor Cron Inteligente iniciado e a vigiar os equipamentos!');
};
