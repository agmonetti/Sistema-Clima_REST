import { requireAuth } from '../middlewares/auth.middleware.js';
import { Router } from 'express';
import { 
    register, 
    login, 
    logout, 
    latido, 
    mostrarLogin, 
    mostrarRegistro 
} from '../controllers/auth.controller.js';

const router = Router();

// Rutas públicas - Mostrar formularios
router.get('/login', mostrarLogin);
router.get('/register', mostrarRegistro);

// Rutas públicas - Procesar formularios
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.post('/logout', logout);
router.post('/ping', requireAuth, latido);

export default router;