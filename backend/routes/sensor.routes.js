import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import * as SensorController from '../controllers/sensor.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Listar sensores - Todos los roles pueden ver
router.get('/', 
    requireRole(['usuario', 'tecnico', 'admin']),
    SensorController.getAllSensors
);

// Mostrar formulario de nuevo sensor - Solo técnico y admin
router.get('/nuevo',
    requireRole(['tecnico', 'admin']),
    SensorController.mostrarFormularioNuevo
);

// Ver detalle de sensor - Todos los roles
router.get('/:id',
    requireRole(['usuario', 'tecnico', 'admin']),
    SensorController.getSensorById
);

// Mostrar formulario de edición - Solo técnico y admin
router.get('/:id/editar',
    requireRole(['tecnico', 'admin']),
    SensorController.mostrarFormularioEditar
);

// Crear sensor - Solo técnico y admin
router.post('/', 
    requireRole(['tecnico', 'admin']),
    SensorController.createSensor
);

// Actualizar sensor - Solo técnico y admin
router.put('/:id', 
    requireRole(['tecnico', 'admin']), 
    SensorController.updateSensor
);

// Eliminar sensor - Solo admin
router.delete('/:id', 
    requireRole(['admin']),
    SensorController.deleteSensor
);

export default router;