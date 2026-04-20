import * as scheduleService from '../services/schedule.service.js';
import * as cronService from '../services/cron.service.js';
import logger from '../utils/logger.js';

export const listSchedules = (req, res) => {
    try {
        const schedules = scheduleService.getAllSchedules();
        res.status(200).json(schedules);
    } catch (error) {
        logger.error(`Erro ao listar automações: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar horários.', error: error.message });
    }
};

export const addSchedule = (req, res) => {
    try {
        const newSchedule = scheduleService.createSchedule(req.body);
        logger.success(`Nova regra de automação criada: "${newSchedule.title}"`);
        res.status(201).json(newSchedule);
    } catch (error) {
        logger.error(`Erro ao criar automação: ${error.message}`);
        res.status(400).json({ message: 'Erro ao criar regra.', error: error.message });
    }
};

export const editSchedule = (req, res) => {
    try {
        const updatedSchedule = scheduleService.updateSchedule(req.params.id, req.body);
        logger.info(`Regra de automação atualizada: "${updatedSchedule.title}"`);
        res.status(200).json(updatedSchedule);
    } catch (error) {
        logger.error(`Erro ao atualizar automação (ID ${req.params.id}): ${error.message}`);
        res.status(400).json({ message: 'Erro ao atualizar regra.', error: error.message });
    }
};

export const removeSchedule = (req, res) => {
    try {
        scheduleService.deleteSchedule(req.params.id);
        logger.warn(`Regra de automação removida permanentemente (ID: ${req.params.id})`);
        res.status(200).json({ message: 'Regra excluída com sucesso!' });
    } catch (error) {
        logger.error(`Erro ao remover automação (ID ${req.params.id}): ${error.message}`);
        res.status(500).json({ message: 'Erro ao excluir regra.', error: error.message });
    }
};

export const getAutomationStatus = (req, res) => {
    res.status(200).json(cronService.getCronStatus());
};

export const toggleAutomation = (req, res) => {
    try {
        const newStatus = cronService.toggleCron();
        res.status(200).json(newStatus);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao alterar estado do motor.' });
    }
};
