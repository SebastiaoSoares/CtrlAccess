import logger from '../utils/logger.js';

export const pingDevice = async (device) => {
    try {
        const response = await fetch(`http://${device.ip}:${device.port || 80}/login.fcgi`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        return true; 
    } catch (error) {
        return false;
    }
};

const getSession = async (ip, port, username, password) => {
    const url = `http://${ip}:${port || 80}/login.fcgi`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: username, password: password })
    });

    if (!response.ok) {
        throw new Error(`Falha de autenticação. O equipamento retornou: ${response.status}`);
    }
    
    const data = await response.json();
    return data.session;
};

export const sendCommand = async (ip, port, endpoint, body, username, password) => {
    let sessionToken = null;

    try {
        sessionToken = await getSession(ip, port, username, password);
        
        const url = `http://${ip}:${port || 80}${endpoint}?session=${sessionToken}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Erro ao executar comando: ${response.status}`);
        }

        const responseText = await response.text();
        return responseText ? JSON.parse(responseText) : { success: true };

    } finally {
        if (sessionToken) {
            const logoutUrl = `http://${ip}:${port || 80}/logout.fcgi?session=${sessionToken}`;
            fetch(logoutUrl, { method: 'POST' }).catch(() => {});
        }
    }
};

export const sendMessageToScreen = async (device, message, timeout = 5000) => {
    const endpoint = '/message_to_screen.fcgi';
    const body = { message, timeout };
    
    logger.hardware(`A enviar mensagem "${message}" para a tela do IP: ${device.ip}`);
    return sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
}

export const openRelay = async (device) => {
    const endpoint = '/remote_user_authorization.fcgi'; 
    
    const body = {
        event: 7,
        user_id: 99999,
        user_name: "Liberacao Remota",
        user_image: false,
        portal_id: 1,
        actions: [ { action: "sec_box", parameters: "id=65793, reason=1" } ]
    };

    logger.hardware(`A enviar comando de Abertura Remota para IP: ${device.ip}`);
    return sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
};

export const rebootDevice = async (device) => {
    const endpoint = '/reboot.fcgi';
    
    logger.hardware(`A enviar comando de REBOOT para IP: ${device.ip}`);
    return sendCommand(device.ip, device.port, endpoint, {}, device.username, device.password);
};

export const setMode = async (device, modeType) => {
    const endpoint = '/set_configuration.fcgi';
    let body = {};

    if (modeType === 'emergencyMode') {
        body = { "general": { "exception_mode": "emergency" } };
    } 
    else if (modeType === 'lockdownMode') {
        body = { "general": { "exception_mode": "lock_down" } }; 
    } 
    else {
        body = { "general": { "exception_mode": "none" } }; 
    }

    logger.hardware(`A enviar configuração de ${modeType} para IP: ${device.ip}`);
    return sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
};

export const setSystemTime = async (device, date) => {
    const endpoint = '/set_system_time.fcgi';
    const body = {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds()
    };
    
    logger.hardware(`A sincronizar relógio do equipamento IP: ${device.ip}`);
    return sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
};

export const resetToFactoryDefault = async (device) => {
    const endpoint = '/reset_to_factory_default.fcgi';
    
    logger.hardware(`ALERTA: Comando de FACTORY RESET enviado para IP: ${device.ip}`);
    return sendCommand(device.ip, device.port, endpoint, {}, device.username, device.password);
}

// CRUD usuários

export const getUsers = async (device) => {
    const endpoint = '/get_users.fcgi';
    
    logger.hardware(`A solicitar lista de utilizadores do IP: ${device.ip}`);
    return sendCommand(device.ip, device.port, endpoint, {}, device.username, device.password);
};
