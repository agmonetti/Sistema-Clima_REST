import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import * as TransaccionController from '../controllers/transaccion.controller.js';

const router = Router();
router.use(requireAuth);

// Listar cuenta y transacciones
router.get('/', TransaccionController.listarTransacciones);

// Mostrar formulario de recarga
router.get('/pagar', TransaccionController.mostrarFormularioPagar);

// Procesar recarga
router.post('/recargar', TransaccionController.recargar);

// Ver factura
router.get('/factura/:id', TransaccionController.verFactura);

// JSON endpoints para compatibilidad
router.post('/solicitar', TransaccionController.solicitarProceso);
router.get('/historial/:usuarioId', TransaccionController.verHistorial);
router.get('/saldo', TransaccionController.obtenerSaldo);

export default router;