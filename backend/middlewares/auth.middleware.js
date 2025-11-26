// Middleware de autenticación basado en sesiones (SSR)
// NO usa JWT - usa sesiones del servidor con Redis

// Verificar que el usuario tiene sesión activa
export const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.session.error = 'Debes iniciar sesión para acceder a esta página';
        return res.redirect('/auth/login');
    }
    // Inyectamos el usuario en req para compatibilidad con controladores existentes
    req.user = req.session.user;
    next();
};

// Verificar roles específicos
export const requireRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.session.error = 'Debes iniciar sesión para acceder a esta página';
            return res.redirect('/auth/login');
        }

        const userRole = req.session.user.rol;
        
        if (!rolesPermitidos.includes(userRole)) {
            return res.status(403).render('error', {
                title: 'Acceso Denegado',
                message: `No tienes permisos para acceder a esta página. Se requiere rol: ${rolesPermitidos.join(' o ')}`,
                error: {}
            });
        }
        
        // Inyectamos el usuario en req para compatibilidad
        req.user = req.session.user;
        next();
    };
};

// Alias para mantener compatibilidad con código existente
export const verifyToken = requireAuth;