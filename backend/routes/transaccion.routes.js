import { Router } from 'express';
import { solicitarProceso,verHistorial } from '../controllers/transaccion.controller.js';


const router = Router();


router.post('/solicitar', solicitarProceso); // POST /api/transaccion/solicitar
router.get('/historial/:usuarioId', verHistorial); // GET /api/transaccion/historial/:usuarioId

export default router;