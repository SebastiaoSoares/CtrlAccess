import db from '../config/database.js';

export const checkStatus = async (req, res) => {
    try {
        const device = deviceService.getDeviceById(req.params.id);
        if (!device) return res.status(404).json({ message: 'Dispositivo não encontrado.' });

        const isOnline = await controlidService.pingDevice(device);
        const currentStatus = isOnline ? 'online' : 'offline';

        if (device.status !== currentStatus) {
            deviceService.updateDevice(device.id, { ...device, status: currentStatus });
        }

        res.status(200).json({ status: currentStatus });
    } catch (error) {
        res.status(500).json({ status: 'offline', message: error.message });
    }
};

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
            status = @status,   -- ADICIONADO: Agora salva o status!
            mode = @mode        -- ADICIONADO: E salva o modo também!
        WHERE id = @id
    `);
    
    stmt.run({ ...deviceData, id });
    return getDeviceById(id);
};

export const deleteDevice = (id) => {
    return db.prepare('DELETE FROM devices WHERE id = ?').run(id);
};
