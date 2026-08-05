import db from '../config/database.js';

export const getAllSchedules = () => {
    return db.prepare('SELECT * FROM schedules').all();
};

export const getScheduleById = (id) => {
    return db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
};

export const createSchedule = (scheduleData) => {
    const stmt = db.prepare(`
        INSERT INTO schedules (title, group_target, time_start, time_end, days, mode)
        VALUES (@title, @group_target, @time_start, @time_end, @days, @mode)
    `);
    
    const dataToSave = { 
        ...scheduleData, 
        days: JSON.stringify(scheduleData.days) 
    };

    const info = stmt.run(dataToSave);
    return getScheduleById(info.lastInsertRowid);
};

export const updateSchedule = (id, scheduleData) => {
    const stmt = db.prepare(`
        UPDATE schedules 
        SET title = @title, 
            group_target = @group_target, 
            time_start = @time_start, 
            time_end = @time_end, 
            days = @days, 
            mode = @mode
        WHERE id = @id
    `);
    
    const dataToSave = { 
        ...scheduleData, 
        days: JSON.stringify(scheduleData.days),
        id 
    };

    stmt.run(dataToSave);
    return getScheduleById(id);
};

export const deleteSchedule = (id) => {
    return db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
};
