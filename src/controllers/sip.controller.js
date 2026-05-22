import { sipService } from '../services/sip.service.js';
import * as deviceService from '../services/device.service.js';
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
        const { deviceId } = req.body;
        const device = deviceService.getDeviceById(deviceId);

        if (!device || !device.sip_target_ramal) {
            return res.status(400).json({ error: 'Configuração SIP ou ramal do operador ausente no banco de dados.' });
        }

        const isPro = await sipService.checkProMode(device);
        if (!isPro) {
            return res.status(403).json({ error: 'O dispositivo não possui Modo PRO/Enterprise ativo.' });
        }
        
        const result = await sipService.makeCall(device, device.sip_target_ramal);
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

export const acordarCatraca = async (req, res) => {
    try {
        const { ip } = req.body;
        if (!ip) return res.status(400).json({ error: 'IP da facial não informado.' });

        const device = deviceService.getDeviceByIp(ip);
        if (!device) return res.status(404).json({ error: 'Dispositivo não encontrado no banco de dados.' });

        logger.info(`[SIP] Acordando facial ${ip} para entrar na Sala Silenciosa (7777)...`);
        
        const result = await sipService.makeCall(device, '7777');
        
        res.status(200).json(result);
    } catch (error) {
        logger.error(`[SIP] Erro ao acordar catraca: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const matarCatraca = async (req, res) => {
    try {
        const { ip } = req.body;
        if (!ip) return res.status(400).json({ error: 'IP da facial não informado.' });

        const device = deviceService.getDeviceByIp(ip);
        if (!device) return res.status(404).json({ error: 'Dispositivo não encontrado no banco de dados.' });

        logger.info(`[SIP] Derrubando chamada à força na placa da facial ${ip}...`);

        const result = await sipService.finalizeCall(device);
        
        res.status(200).json(result);
    } catch (error) {
        logger.error(`[SIP] Erro ao matar catraca: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
};
