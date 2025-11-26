import * as UsuarioService from '../services/usuario.service.js';
import * as AuthService from '../services/auth.service.js';
import redisClient from '../config/redis.js';

// Listar usuarios - SSR
export const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await UsuarioService.obtenerTodos();
        const usuariosConEstado = await Promise.all(usuarios.map(async (u) => {
            const isOnline = await redisClient.get(`ONLINE:${u.usuario_id}`);
            return {
                ...u,
                isOnline: !!isOnline 
            };
        }));
        
        res.render('usuarios/index', {
            title: 'Gestión de Usuarios',
            usuarios: usuariosConEstado
        });   
    } catch (error) {
        console.error(error);
        req.session.error = 'Error al obtener la lista de usuarios';
        res.render('usuarios/index', {
            title: 'Gestión de Usuarios',
            usuarios: []
        });
    }
};

// Mostrar formulario de nuevo usuario
export const mostrarFormularioNuevo = (req, res) => {
    res.render('usuarios/nuevo', { title: 'Nuevo Usuario' });
};

// Crear usuario - SSR
export const crearUsuario = async (req, res) => {
    try {
        const datos = req.body;
        await AuthService.register({
            nombre: datos.nombre,
            mail: datos.mail,
            password: datos.password,
            rol_descripcion: datos.rol || 'usuario'
        });
        
        req.session.success = 'Usuario creado exitosamente';
        res.redirect('/usuarios');
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/usuarios/nuevo');
    }
};

// Mostrar detalle de usuario
export const verUsuario = async (req, res) => {
    try {
        const { id } = req.params; 
        const usuario = await UsuarioService.buscarPorId(id);

        if (!usuario) {
            req.session.error = 'Usuario no encontrado';
            return res.redirect('/usuarios');
        }

        res.render('usuarios/detalle', {
            title: usuario.nombre,
            usuario
        });
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/usuarios');
    }
};

// Mostrar formulario de edición
export const mostrarFormularioEditar = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await UsuarioService.buscarPorId(id);

        if (!usuario) {
            req.session.error = 'Usuario no encontrado';
            return res.redirect('/usuarios');
        }

        res.render('usuarios/editar', {
            title: 'Editar Usuario',
            usuario
        });
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/usuarios');
    }
};

// Actualizar usuario - SSR
export const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        // Implementar actualización si es necesario
        req.session.success = 'Usuario actualizado';
        res.redirect('/usuarios/' + id);
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/usuarios/' + req.params.id + '/editar');
    }
};

// Eliminar (desactivar) usuario - SSR
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await UsuarioService.borrarUsuario(id);
        
        req.session.success = 'Usuario desactivado correctamente';
        res.redirect('/usuarios');
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/usuarios');
    }
};

// Reactivar usuario - SSR
export const revivirUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        await UsuarioService.revivirUsuario(id);
        
        req.session.success = 'Usuario reactivado correctamente';
        res.redirect('/usuarios');
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/usuarios');
    }
};

// Darse de baja - SSR
export const darseDeBaja = async (req, res) => {
    try {
        const miId = req.user.id; 
        await UsuarioService.eliminarPropiaCuenta(miId);

        // Destruir sesión
        req.session.destroy((err) => {
            if (err) console.error(err);
            res.redirect('/auth/login');
        });

    } catch (error) {
        req.session.error = error.message;
        res.redirect('/transacciones');
    }
};

// Listar usuarios (JSON - para compatibilidad)
export const getUsers = async (req, res) => {
    try {
        const usuarios = await UsuarioService.obtenerTodos();
        const usuariosConEstado = await Promise.all(usuarios.map(async (u) => {
            const isOnline = await redisClient.get(`ONLINE:${u.usuario_id}`);
            return {
                ...u,
                isOnline: !!isOnline 
            };
        }));
        res.status(200).json(usuariosConEstado);   
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la lista de usuarios.' });
    }
};

// Buscar por ID (JSON - para compatibilidad)
export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params; 
        const usuario = await UsuarioService.buscarPorId(id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { contraseña, ...usuarioPublico } = usuario; 
        res.json(usuarioPublico);
    } catch (error) {
        console.error("Error al buscar usuario por ID:", error);
        res.status(500).json({ error: error.message });
    }
};

