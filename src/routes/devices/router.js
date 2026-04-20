import { Router } from 'express';
import * as deviceController from '../../controllers/device.controller.js';

const router = Router();

// CRUD
router.get('/', deviceController.listDevices);
router.get('/:id', deviceController.getDevice);
router.post('/', deviceController.addDevice);
router.patch('/:id', deviceController.editDevice);
router.delete('/:id', deviceController.removeDevice);

// Hardware
router.get('/:id/status', deviceController.checkStatus);
router.post('/:id/open', deviceController.openDoor);
router.post('/:id/restart', deviceController.restartDevice);

// Controle de Estado
router.post('/:id/normal', deviceController.changeMode('normalMode'));
router.post('/:id/emergency', deviceController.changeMode('emergencyMode'));
router.post('/:id/lockdown', deviceController.changeMode('lockdownMode'));

export default router;
