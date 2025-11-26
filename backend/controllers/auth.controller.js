import * as AuthService from '../services/auth.service.js';
import redisClient from '../config/redis.js';
import * as UsuarioRepository from '../repositories/postgres/usuario.repository.js';
import bcrypt from 'bcryptjs';

// Mostrar formulario de login
export const mostrarLogin = (req, res) => {
    // Si ya está logueado, redirigir a sensores
    if (req.session && req.session.user) {
        return res.redirect('/sensores');
    }
    res.render('auth/login', { title: 'Iniciar Sesión' });
};

// Mostrar formulario de registro
export const mostrarRegistro = (req, res) => {
    // Si ya está logueado, redirigir a sensores
    if (req.session && req.session.user) {
        return res.redirect('/sensores');
    }
    res.render('auth/register', { title: 'Crear Cuenta' });
};

// REGISTRO - SSR
export const register = async (req, res) => {
    try {
        const datos = req.body;
        
        // Validar que las contraseñas coinciden
        if (datos.password !== datos.confirmPassword) {
            req.session.error = 'Las contraseñas no coinciden';
            return res.redirect('/auth/register');
        }
        
        const usuarioCreado = await AuthService.register(datos);
        
        req.session.success = 'Cuenta creada exitosamente. Por favor inicia sesión.';
        res.redirect('/auth/login');
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/auth/register');
    }
};

// LOGIN - SSR
export const login = async (req, res) => {
    try {
        const { mail, password } = req.body;
        
        // Buscar usuario
        const usuario = await UsuarioRepository.buscarPorEmail(mail);
        
        if (!usuario) {
            req.session.error = 'Usuario no encontrado';
            return res.redirect('/auth/login');
        }
        
        if (!usuario.isActive) {
            req.session.error = 'Esta cuenta ha sido desactivada';
            return res.redirect('/auth/login');
        }
        
        // Verificar contraseña
        const esPasswordValido = await bcrypt.compare(password, usuario.contraseña);
        if (!esPasswordValido) {
            req.session.error = 'Credenciales inválidas';
            return res.redirect('/auth/login');
        }
        
        // Crear sesión
        req.session.user = {
            id: usuario.usuario_id,
            nombre: usuario.nombre,
            mail: usuario.mail,
            rol: usuario.rol
        };
        
        // Marcar como online en Redis
        try {
            await redisClient.set(`ONLINE:${usuario.usuario_id}`, '1', { EX: 3600 });
        } catch (e) {
            console.error('Redis error:', e);
        }
        
        req.session.success = `Bienvenido, ${usuario.nombre}`;
        res.redirect('/sensores');
    } catch (error) {
        console.error('Login error:', error);
        req.session.error = error.message;
        res.redirect('/auth/login');
    }
};

// LOGOUT - SSR
export const logout = (req, res) => {
    const userId = req.session.user?.id;
    
    // Marcar como offline en Redis
    if (userId) {
        redisClient.del(`ONLINE:${userId}`).catch(console.error);
    }
    
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/auth/login');
    });
};

// HEARTBEAT (mantiene la sesión activa)
export const latido = async (req, res) => {
    try {
        const userId = req.user?.id || req.session?.user?.id;
        
        if (userId) {
            await redisClient.set(`ONLINE:${userId}`, '1', { EX: 60 });
        }
        
        res.status(200).json({ status: 'OK' }); 

    } catch (error) {
        console.error("Redis Error:", error);
        res.status(200).json({ status: 'OK', warning: 'Redis unavailable' }); 
    }
};