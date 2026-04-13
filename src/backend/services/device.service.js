import db from '../config/database.js';

export const getAllDevices = () => {
    return db.prepare('SELECT * FROM devices').all();
};

export const getDeviceById = (id) => {
    return db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
};

export const createDevice = (deviceData) => {
    const stmt = db.prepare(`
        INSERT INTO devices (name, sector_group, ip, port, username, password, status, mode)
        VALUES (@name, @sector_group, @ip, @port, @username, @password, 'offline', 'normalMode')
    `);
    
    const info = stmt.run(deviceData);
    return getDeviceById(info.lastInsertRowid);
};

export const updateDevice = (id, deviceData) => {
    const stmt = db.prepare(`
        UPDATE devices 
        SET name = @name, 
            sector_group = @sector_group, 
            ip = @ip, 
            port = @port, 
            username = @username, 
            password = @password,
            status = @status,   
            mode = @mode        
        WHERE id = @id
    `);
    
    stmt.run({ ...deviceData, id });
    return getDeviceById(id);
};

export const deleteDevice = (id) => {
    return db.prepare('DELETE FROM devices WHERE id = ?').run(id);
};
