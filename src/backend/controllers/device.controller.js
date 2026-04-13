import * as deviceService from '../services/device.service.js';
import * as controlidService from '../services/controlid.service.js';


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
        if (!device) return res.status(404).json({ message: 'Dispositivo não encontrado.' });
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
        res.status(200).json({ message: `Dispositivo excluído com sucesso!` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover dispositivo.', error: error.message });
    }
};


export const checkStatus = (req, res) => {
    res.status(200).json({ message: `Estado do dispositivo ${req.params.id}.`, status: 'online' });
};

// export const sendMessage = async (req, res) => {
//     try {
//         const device = deviceService.getDeviceById(req.params.id);
//         if (!device) return res.status(404).json({ message: 'Dispositivo não encontrado.' });

//         await controlidService.sendMessageToScreen(device, req.body.message, req.body.timeout);
//         res.status(200).json({ message: `Mensagem enviada para ${device.name}.` });
//     } catch (error) {
//         res.status(500).json({ message: 'Falha ao enviar mensagem.', error: error.message });
//     }
// };

export const openDoor = async (req, res) => {
    try {
        const device = deviceService.getDeviceById(req.params.id);
        if (!device) return res.status(404).json({ message: 'Dispositivo não encontrado.' });

        await controlidService.openRelay(device);
        res.status(200).json({ message: `Comando de abertura enviado para ${device.name}.` });
    } catch (error) {
        res.status(500).json({ message: 'Falha ao comunicar com o hardware.', error: error.message });
    }
};

export const restartDevice = async (req, res) => {
    try {
        const device = deviceService.getDeviceById(req.params.id);
        if (!device) return res.status(404).json({ message: 'Dispositivo não encontrado.' });

        await controlidService.rebootDevice(device);
        res.status(200).json({ message: `A reiniciar o dispositivo ${device.name}...` });
    } catch (error) {
        res.status(500).json({ message: 'Falha ao reiniciar.', error: error.message });
    }
};

export const changeMode = (modeName) => async (req, res) => {
    try {
        const device = deviceService.getDeviceById(req.params.id);
        if (!device) return res.status(404).json({ message: 'Dispositivo não encontrado.' });

        await controlidService.setMode(device, modeName);
        deviceService.updateDevice(device.id, { ...device, mode: modeName });

        res.status(200).json({ message: `Modo ${modeName} ativado em ${device.name}.` });
    } catch (error) {
        res.status(500).json({ message: 'Falha ao alterar o modo.', error: error.message });
    }
};
