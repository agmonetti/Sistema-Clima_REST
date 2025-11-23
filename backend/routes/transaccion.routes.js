import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import * as TransaccionController from '../controllers/transaccion.controller.js';

const router = Router();

router.use(verifyToken);
router.post('/solicitar', TransaccionController.solicitarProceso); // POST /api/transaccion/solicitar
router.get('/historial/:usuarioId', TransaccionController.verHistorial); // GET /api/transaccion/historial/:usuarioId
router.get('/saldo', TransaccionController.obtenerSaldo);
router.post('/recargar', TransaccionController.recargar);

export default router;