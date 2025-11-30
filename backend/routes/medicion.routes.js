import { Router } from 'express';
import { listarMediciones, registrarMedicion, listarSensores, obtenerCiudades, verHistorialSensor } from '../controllers/medicion.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js'; 

const router = Router();

// Ruta SSR para ver historial de mediciones
router.get('/', requireAuth, listarMediciones);

// Endpoint para recibir mediciones de sensores (mantiene JSON para sensores IoT)
router.post('/registro', registrarMedicion);

// Rutas JSON auxiliares (pueden ser eliminadas si no se usan)
router.get('/sensores', requireAuth, listarSensores);
router.get('/ciudades', requireAuth, obtenerCiudades);
router.get('/historial/:sensorId', requireAuth, verHistorialSensor);

export default router;