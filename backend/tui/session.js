/**
 * Gestor de sesión en memoria para la TUI
 * NO usa HTTP ni tokens JWT - solo mantiene el estado en memoria
 */

class SessionManager {
    constructor() {
        this.usuario = null;
    }

    /**
     * Guarda el usuario logueado en la sesión
     * @param {Object} usuario - Datos del usuario
     */
    login(usuario) {
        this.usuario = {
            id: usuario.usuario_id || usuario.id,
            nombre: usuario.nombre,
            mail: usuario.mail,
            rol: usuario.rol,
            saldoActual: usuario.saldoActual || 0
        };
    }

    /**
     * Cierra la sesión actual
     */
    logout() {
        this.usuario = null;
    }

    /**
     * Verifica si hay un usuario logueado
     * @returns {boolean}
     */
    estaLogueado() {
        return this.usuario !== null;
    }

    /**
     * Obtiene el usuario actual
     * @returns {Object|null}
     */
    getUser() {
        return this.usuario;
    }

    /**
     * Obtiene el ID del usuario actual
     * @returns {number|null}
     */
    getUserId() {
        return this.usuario?.id || null;
    }

    /**
     * Obtiene el rol del usuario actual
     * @returns {string|null}
     */
    getRol() {
        return this.usuario?.rol || null;
    }

    /**
     * Verifica si el usuario tiene un rol específico
     * @param {string|string[]} roles - Rol o array de roles permitidos
     * @returns {boolean}
     */
    hasRole(roles) {
        if (!this.usuario) return false;
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        return rolesArray.includes(this.usuario.rol);
    }

    /**
     * Actualiza el saldo del usuario en la sesión
     * @param {number} nuevoSaldo
     */
    actualizarSaldo(nuevoSaldo) {
        if (this.usuario) {
            this.usuario.saldoActual = nuevoSaldo;
        }
    }
}

// Exportamos una instancia única (singleton)
export const session = new SessionManager();
