import * as deviceService from '../services/device.service.js';

export const listDevices = (req, res) => {
    try {
        const devices = deviceService.getAllDevices();
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar dispositivos.', error: error.message });
    }
};

export const getDevice = (req, res) => {
    try {
        const device = deviceService.getDeviceById(req.params.id);
        if (!device) {
            return res.status(404).json({ message: 'Dispositivo não encontrado.' });
        }
        res.status(200).json(device);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dispositivo.', error: error.message });
    }
};

export const addDevice = (req, res) => {
    try {
        const newDevice = deviceService.createDevice(req.body);
        res.status(201).json({ message: 'Dispositivo cadastrado com sucesso!', payload: newDevice });
    } catch (error) {
        res.status(400).json({ message: 'Erro ao cadastrar dispositivo.', error: error.message });
    }
};

export const editDevice = (req, res) => {
    try {
        const updatedDevice = deviceService.updateDevice(req.params.id, req.body);
        res.status(200).json({ message: 'Dispositivo atualizado com sucesso!', payload: updatedDevice });
    } catch (error) {
        res.status(400).json({ message: 'Erro ao atualizar dispositivo.', error: error.message });
    }
};

export const removeDevice = (req, res) => {
    try {
        deviceService.deleteDevice(req.params.id);
        res.status(200).json({ message: `Dispositivo ${req.params.id} excluído com sucesso!` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover dispositivo.', error: error.message });
    }
};

export const checkStatus = (req, res) => {
    // TODO: Injetar serviço de Healthcheck/Ping (Control iD)
    res.status(200).json({ message: `Estado do dispositivo ${req.params.id}.`, status: 'online' });
};

export const openDoor = (req, res) => {
    // TODO: Injetar serviço de Abertura de Relé (Control iD)
    res.status(200).json({ message: `Comando de abertura enviado para o dispositivo ${req.params.id}.` });
};

export const restartDevice = (req, res) => {
    // TODO: Injetar serviço de Reboot (Control iD)
    res.status(200).json({ message: `Comando de reinicialização enviado para o dispositivo ${req.params.id}.` });
};

export const changeMode = (modeName) => (req, res) => {
    // TODO: Atualizar a coluna 'mode' na tabela 'devices' e enviar comando HTTP (Control iD)
    res.status(200).json({ message: `Modo ${modeName} acionado no dispositivo ${req.params.id}.` });
};
