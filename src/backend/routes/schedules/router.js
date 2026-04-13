import { Router } from 'express';
import * as scheduleController from '../../controllers/schedule.controller.js';

const router = Router();

router.get('/', scheduleController.listSchedules);
router.post('/', scheduleController.addSchedule);
router.patch('/:id', scheduleController.editSchedule);
router.delete('/:id', scheduleController.removeSchedule);

export default router;
