import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import * as ProcesoController from '../controllers/proceso.controller.js';

const router = Router();
router.use(requireAuth);

// Listar procesos y mis solicitudes
router.get('/', ProcesoController.listarProcesos);

// Mostrar formulario de solicitud
router.get('/solicitar', ProcesoController.mostrarFormularioSolicitar);

// Procesar solicitud
router.post('/solicitar', ProcesoController.solicitarProceso);

// Ver detalle de solicitud
router.get('/:id', ProcesoController.verDetalleSolicitud);

export default router;