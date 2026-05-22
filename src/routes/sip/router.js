import express from 'express';
import * as sipController from '../../controllers/sip.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/check-pro', sipController.checkProStatus);
router.post('/enable', sipController.enableSip);
router.post('/make-call', sipController.makeCall);
router.post('/finalize-call', sipController.finalizeCall);
router.post('/status', sipController.getStatus);
router.post('/acordar-catraca', sipController.acordarCatraca);
router.post('/matar-catraca', sipController.matarCatraca);

export default router;
