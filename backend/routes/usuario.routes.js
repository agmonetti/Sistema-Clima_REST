import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import * as UsuarioController from '../controllers/usuario.controller.js';

const router = Router();
router.use(requireAuth);

// Darse de baja (usuario actual)
router.delete('/me', UsuarioController.darseDeBaja);

// Rutas de administración - Solo admin
router.get('/', requireRole(['admin']), UsuarioController.listarUsuarios);
router.get('/nuevo', requireRole(['admin']), UsuarioController.mostrarFormularioNuevo);
router.post('/', requireRole(['admin']), UsuarioController.crearUsuario);

// Ver detalle de usuario
router.get('/:id', requireRole(['admin']), UsuarioController.verUsuario);

// Editar usuario
router.get('/:id/editar', requireRole(['admin']), UsuarioController.mostrarFormularioEditar);
router.put('/:id', requireRole(['admin']), UsuarioController.actualizarUsuario);

// Eliminar (desactivar) usuario
router.delete('/:id', requireRole(['admin']), UsuarioController.deleteUser);

// Reactivar usuario
router.patch('/:id/revivir', requireRole(['admin']), UsuarioController.revivirUsuario);

// JSON endpoints para compatibilidad
router.get('/id/:id', UsuarioController.buscarPorId);

export default router;