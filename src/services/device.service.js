import db from '../config/database.js';

export const getAllDevices = () => {
    return db.prepare('SELECT * FROM devices').all();
};

export const getDeviceById = (id) => {
    return db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
};

export const createDevice = (deviceData) => {
    const stmt = db.prepare(`
        INSERT INTO devices (name, sector_group, ip, port, username, password, status, mode, sip_active)
        VALUES (@name, @sector_group, @ip, @port, @username, @password, 'offline', 'normalMode', 0)
    `);
    
    const info = stmt.run(deviceData);
    return getDeviceById(info.lastInsertRowid);
};

export const updateDevice = (id, deviceData) => {
    const currentDevice = getDeviceById(id);
    if (!currentDevice) throw new Error("Dispositivo não encontrado.");

    const dataToSave = { ...currentDevice, ...deviceData, id };

    const stmt = db.prepare(`
        UPDATE devices 
        SET name = @name, 
            sector_group = @sector_group, 
            ip = @ip, 
            port = @port, 
            username = @username, 
            password = @password,
            status = @status,   
            mode = @mode,
            sip_active = @sip_active,
            sip_server = @sip_server,
            sip_user = @sip_user,
            sip_password = @sip_password,
            sip_target_ramal = @sip_target_ramal
        WHERE id = @id
    `);
    
    stmt.run(dataToSave);
    return getDeviceById(id);
};

export const deleteDevice = (id) => {
    return db.prepare('DELETE FROM devices WHERE id = ?').run(id);
};

export const getDeviceByIp = (ip) => {
    return db.prepare('SELECT * FROM devices WHERE ip = ?').get(ip);
};
