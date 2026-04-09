export const pingDevice = async (device) => {
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

    console.log(`[HARDWARE] A enviar comando de Abertura Remota para IP: ${device.ip}`);

    return sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
};

export const rebootDevice = async (device) => {
    const endpoint = '/reboot.fcgi';
    return sendCommand(device.ip, device.port, endpoint, {}, device.username, device.password);
};

export const setMode = async (device, modeType) => {
    // setMode
};