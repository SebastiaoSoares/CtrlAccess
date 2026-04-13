// conection

export const pingDevice = async (device) => {
    // tenta conectar ao dispositivo para verificar o status

    try {
        const response = await fetch(`http://${device.ip}:${device.port || 80}/login.fcgi`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        return true; 
    } catch (error) {
        return false;
    }
};

const getSession = async (ip, port, username, password) => {
    // realiza login e obtém token de sessão para requisições autenticadas

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

const sendCommand = async (ip, port, endpoint, body, username, password) => {
    // envia comando autenticado para o dispositivo, gerenciando sessão e logout automático

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


// configs

export const sendMessageToScreen = async (device, message, timeout = 3000) => {
    // mostra mensagem na tela por tempo determinado em milisegundos

    const endpoint = '/message_to_screen.fcgi';
    const body = { message, timeout };
    return sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
}

export const openRelay = async (device) => {
    // envia comando de abertura utilizando função de autorização remota

    const endpoint = '/remote_user_authorization.fcgi'; 
    
    const body = {
        event: 7,
        user_id: 99999,
        user_name: "Liberacao Remota",
        user_image: false,
        portal_id: 1,
        actions: [ { action: "sec_box", parameters: "id=65793, reason=1" } ]
    };

    console.log(`[HARDWARE] A enviar comando de Abertura Remota para IP: ${device.ip}`);

    return sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
};

export const rebootDevice = async (device) => {
    // reinicia o dispositivo

    const endpoint = '/reboot.fcgi';
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

    console.log(`[HARDWARE] A enviar configuração de ${modeType} para IP: ${device.ip}`);
    
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
    return sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
};

export const resetToFactoryDefault = async (device) => {
    const endpoint = '/reset_to_factory_default.fcgi';
    return sendCommand(device.ip, device.port, endpoint, {}, device.username, device.password);
}


// users

export const getUsers = async (device) => {
    const endpoint = '/get_users.fcgi';
    return sendCommand(device.ip, device.port, endpoint, {}, device.username, device.password);
};
