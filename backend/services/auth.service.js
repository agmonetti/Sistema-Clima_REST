import bcrypt from 'bcryptjs';
import * as UsuarioRepository from '../repositories/postgres/usuario.repository.js';

/**
 * Lógica de REGISTRO
 * 1. Encriptar contraseña.
 * 2. Llamar al repositorio para guardar en Postgres (Transacción).
 * 3. Retornar el usuario creado (sin la contraseña).
 */
export async function register(datosUsuario) {
    const { nombre, mail, password, rol_descripcion } = datosUsuario;

    // Revisamos si existe
    const usuarioExistente = await UsuarioRepository.buscarPorEmail(mail);
    if (usuarioExistente) {
        throw new Error('El email ya está registrado');
    }

    // Hasheamos la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Creamos el usuario con la contraseña hasheada
    const nuevoId = await UsuarioRepository.crearUsuarios({
        nombre,
        mail,
        password: passwordHash,
        rol_descripcion: rol_descripcion || 'usuario' // rol por defecto
    });

    return { id: nuevoId, nombre, mail };
}

/**
 * Lógica de LOGIN (SSR - Sin JWT)
 * 1. Buscar usuario por email.
 * 2. Comparar contraseña (hash vs plano).
 * 3. Retornar datos del usuario para la sesión.
 * 
 * Nota: El manejo de sesiones se hace en el controlador.
 */
export async function login({ mail, password }) {
    // Buscamos el usuario
    const usuario = await UsuarioRepository.buscarPorEmail(mail);
    if (!usuario) {
        throw new Error('Usuario no existente');
    }
    if (!usuario.isActive) {
        throw new Error('Acceso denegado: Esta cuenta ha sido eliminada o desactivada.');
    }

    // Validamos que la contraseña coincida
    const esPasswordValido = await bcrypt.compare(password, usuario.contraseña);
    if (!esPasswordValido) {
        throw new Error('Credenciales invalidas');
    }

    // Retornamos datos del usuario (sin la contraseña)
    // El controlador se encarga de crear la sesión
    const { contraseña, ...usuarioSinPass } = usuario;
    return { user: usuarioSinPass };
}