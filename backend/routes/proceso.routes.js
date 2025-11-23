import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import * as ProcesoController from '../controllers/proceso.controller.js';

const router = Router();
router.use(verifyToken);

router.get('/', ProcesoController.listarCatalogo);

export default router;