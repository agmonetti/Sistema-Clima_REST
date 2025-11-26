import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import * as MensajeriaController from '../controllers/mensajeria.controller.js';

const router = Router();
router.use(requireAuth);

// Listar conversaciones
router.get('/', MensajeriaController.listarConversaciones);

// Mostrar formulario de nueva conversación
router.get('/nuevo', MensajeriaController.mostrarFormularioNuevo);

// Iniciar chat privado
router.post('/privado', MensajeriaController.iniciarPrivado);

// Crear grupo
router.post('/grupo', MensajeriaController.crearGrupo);

// Enviar mensaje
router.post('/:id/enviar', MensajeriaController.enviar);

// Historial de mensajes (JSON - para compatibilidad)
router.get('/:id/mensajes', MensajeriaController.historial);

export default router;