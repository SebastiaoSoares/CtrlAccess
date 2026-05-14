import { sipService } from '../services/sip.service.js';
import logger from '../utils/logger.js';

const extractDevice = (req) => {
    return {
        ip: req.body.deviceIp,
        port: req.body.port || 80,
        username: req.body.username,
        password: req.body.password
    };
};

export const checkProStatus = async (req, res) => {
    try {
        const device = extractDevice(req);
        if (!device.ip) return res.status(400).json({ error: 'IP do dispositivo não informado' });

        const isPro = await sipService.checkProMode(device);
        res.status(200).json({ success: true, isPro });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const enableSip = async (req, res) => {
    try {
        const device = extractDevice(req);
        const { sipParams } = req.body; 

        if (!device.ip || !sipParams || !sipParams.serverIp) {
            return res.status(400).json({ error: 'Dados do dispositivo ou parâmetros SIP inválidos.' });
        }

        const result = await sipService.enableSipConfig(device, sipParams);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const makeCall = async (req, res) => {
    try {
        const device = extractDevice(req);
        const { target } = req.body;

        if (!device.ip || !target) {
            return res.status(400).json({ error: 'IP e ramal de destino (target) são obrigatórios.' });
        }
        
        const result = await sipService.makeCall(device, target);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const finalizeCall = async (req, res) => {
    try {
        const device = extractDevice(req);
        if (!device.ip) return res.status(400).json({ error: 'IP do dispositivo não informado' });

        const result = await sipService.finalizeCall(device);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getStatus = async (req, res) => {
    try {
        const device = extractDevice(req);
        if (!device.ip) return res.status(400).json({ error: 'IP do dispositivo não informado' });

        const status = await sipService.getStatus(device);
        res.status(200).json({ success: true, status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
