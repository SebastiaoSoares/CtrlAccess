import * as deviceService from '../services/device.service.js';
import * as controlidService from '../services/controlid.service.js';
import logger from '../utils/logger.js';

export const listDevices = (req, res) => {
    try {
        const devices = deviceService.getAllDevices();
        res.status(200).json(devices);
    } catch (error) {
        logger.error(`Erro ao listar dispositivos: ${error.message}`);
        res.status(500).json({ message: 'Erro ao listar dispositivos.', error: error.message });
    }
};

export const getDevice = (req, res) => {
    try {
        const device = deviceService.getDeviceById(req.params.id);
        if (!device) return res.status(404).json({ message: 'Dispositivo não encontrado.' });
        res.status(200).json(device);
    } catch (error) {
        logger.error(`Erro ao buscar dispositivo ID ${req.params.id}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar dispositivo.', error: error.message });
    }
};

export const addDevice = (req, res) => {
    try {
        const newDevice = deviceService.createDevice(req.body);
        logger.success(`Novo dispositivo cadastrado: ${newDevice.name} (${newDevice.ip})`);
        res.status(201).json({ message: 'Dispositivo cadastrado com sucesso!', payload: newDevice });
    } catch (error) {
        logger.error(`Erro ao cadastrar dispositivo: ${error.message}`);
        res.status(400).json({ message: 'Erro ao cadastrar dispositivo.', error: error.message });
    }
};

export const editDevice = (req, res) => {
    try {
        const existingDevice = deviceService.getDeviceById(req.params.id);
        if (!existingDevice) return res.status(404).json({ message: 'Dispositivo não encontrado.' });

        const dataToUpdate = { ...existingDevice, ...req.body };
        
        const updatedDevice = deviceService.updateDevice(req.params.id, dataToUpdate);
        logger.info(`Dispositivo atualizado: ${updatedDevice.name} (ID: ${req.params.id})`);
        res.status(200).json({ message: 'Dispositivo atualizado com sucesso!', payload: updatedDevice });
    } catch (error) {
        logger.error(`Erro ao atualizar dispositivo ID ${req.params.id}: ${error.message}`);
        res.status(400).json({ message: 'Erro ao atualizar dispositivo.', error: error.message });
    }
};

export const removeDevice = (req, res) => {
    try {
        deviceService.deleteDevice(req.params.id);
        logger.warn(`Dispositivo excluído permanentemente (ID: ${req.params.id})`);
        res.status(200).json({ message: `Dispositivo excluído com sucesso!` });
    } catch (error) {
        logger.error(`Erro ao remover dispositivo ID ${req.params.id}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao remover dispositivo.', error: error.message });
    }
};

export const checkStatus = (req, res) => {
    res.status(200).json({ message: `Estado do dispositivo ${req.params.id}.`, status: 'online' });
};

export const sendMessage = async (req, res) => {
    try {
        const device = deviceService.getDeviceById(req.params.id);
        if (!device) return res.status(404).json({ message: 'Dispositivo não encontrado.' });

        logger.hardware(`A enviar mensagem para tela de ${device.name}: "${req.body.message}"`);
        await controlidService.sendMessageToScreen(device, req.body.message, req.body.timeout);
        
        res.status(200).json({ message: `Mensagem enviada para ${device.name}.` });
    } catch (error) {
        logger.error(`Falha ao enviar mensagem (ID ${req.params.id}): ${error.message}`);
        res.status(500).json({ message: 'Falha ao enviar mensagem.', error: error.message });
    }
};

export const openDoor = async (req, res) => {
    try {
        const device = deviceService.getDeviceById(req.params.id);
        if (!device) {
            logger.warn(`Tentativa de abertura em dispositivo inexistente (ID: ${req.params.id})`);
            return res.status(404).json({ message: 'Dispositivo não encontrado.' });
        }

        logger.hardware(`Comando de Abertura solicitado para: ${device.name}`);
        await controlidService.openRelay(device);
        
        logger.success(`Porta aberta remotamente: ${device.name}`);
        res.status(200).json({ message: `Comando de abertura enviado para ${device.name}.` });
    } catch (error) {
        logger.error(`Falha ao abrir porta (ID ${req.params.id}): ${error.message}`);
        res.status(500).json({ message: 'Falha ao comunicar com o hardware.', error: error.message });
    }
};

export const restartDevice = async (req, res) => {
    try {
        const device = deviceService.getDeviceById(req.params.id);
        if (!device) return res.status(404).json({ message: 'Dispositivo não encontrado.' });

        logger.hardware(`Comando de REBOOT enviado para: ${device.name}`);
        await controlidService.rebootDevice(device);
        
        res.status(200).json({ message: `A reiniciar o dispositivo ${device.name}...` });
    } catch (error) {
        logger.error(`Falha no reboot (ID ${req.params.id}): ${error.message}`);
        res.status(500).json({ message: 'Falha ao reiniciar.', error: error.message });
    }
};

export const changeMode = (modeName) => async (req, res) => {
    try {
        const device = deviceService.getDeviceById(req.params.id);
        if (!device) return res.status(404).json({ message: 'Dispositivo não encontrado.' });

        logger.hardware(`Alteração de segurança solicitada: ${device.name} -> ${modeName.toUpperCase()}`);
        await controlidService.setMode(device, modeName);
        
        deviceService.updateDevice(device.id, { ...device, mode: modeName });

        logger.info(`Modo de ${device.name} guardado na BD como ${modeName}`);
        res.status(200).json({ message: `Modo ${modeName} ativado em ${device.name}.` });
    } catch (error) {
        logger.error(`Falha ao mudar modo (ID ${req.params.id} para ${modeName}): ${error.message}`);
        res.status(500).json({ message: 'Falha ao alterar o modo.', error: error.message });
    }
};
