import { Router } from 'express';
import * as scheduleController from '../../controllers/schedule.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/status', scheduleController.getAutomationStatus);
router.post('/toggle', scheduleController.toggleAutomation);

router.get('/', scheduleController.listSchedules);
router.post('/', scheduleController.addSchedule);
router.patch('/:id', scheduleController.editSchedule);
router.delete('/:id', scheduleController.removeSchedule);

export default router;
