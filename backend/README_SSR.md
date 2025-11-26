# ClimaApp - Aplicación Web con Server-Side Rendering (SSR)

## ⚠️ IMPORTANTE: Esto NO es una API REST

Esta aplicación utiliza **Server-Side Rendering (SSR)** con EJS como motor de templates. El servidor renderiza HTML directamente, NO devuelve JSON.

### Diferencias clave con una API REST:

| Característica | API REST | Esta App (SSR) |
|---|---|---|
| Respuesta del servidor | JSON | HTML |
| Autenticación | JWT Tokens | Sesiones del servidor |
| Comunicación | AJAX/Fetch | Formularios HTML |
| Estado | Stateless | Stateful (sesiones) |
| Prefijo de rutas | `/api/*` | Rutas directas |
| CORS | Necesario | No necesario |

---

## 🏗️ Arquitectura

```
backend/
├── app.js              # Configuración principal Express + EJS
├── index.js            # Punto de entrada
├── config/             # Configuración de bases de datos
├── controllers/        # Controladores (usan res.render())
├── middlewares/        # Autenticación por sesión
├── models/             # Modelos Mongoose (MongoDB)
├── repositories/       # Acceso a datos
├── routes/             # Rutas SSR (sin /api/)
├── services/           # Lógica de negocio
├── views/              # Templates EJS
│   ├── partials/       # Componentes reutilizables
│   ├── auth/           # Login y registro
│   ├── sensores/       # Gestión de sensores
│   ├── mediciones/     # Historial de mediciones
│   ├── procesos/       # Solicitud de procesos
│   ├── mensajeria/     # Chat entre usuarios
│   ├── usuarios/       # Administración (solo admin)
│   └── transacciones/  # Cuenta corriente y pagos
└── public/             # Archivos estáticos
    ├── css/            # Estilos
    └── js/             # JavaScript del cliente
```

---

## 🔐 Sistema de Autenticación

### Sesiones del Servidor
- Usa `express-session` con almacenamiento en Redis
- Las sesiones duran 24 horas
- No se usan JWT tokens en ningún momento

### Flujo de Autenticación
1. Usuario envía formulario de login
2. Servidor valida credenciales
3. Se crea sesión en Redis
4. Cookie de sesión se envía al navegador
5. Navegador incluye cookie en cada petición
6. Middleware verifica sesión activa

### Middleware
```javascript
// middlewares/auth.middleware.js
export const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

export const requireRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.session.user.rol)) {
            return res.status(403).render('error', { ... });
        }
        next();
    };
};
```

---

## 👥 Roles de Usuario

| Rol | Permisos |
|---|---|
| **usuario** | Ver sensores, solicitar procesos, mensajería, recargar saldo |
| **técnico** | Todo lo anterior + crear/editar sensores |
| **admin** | Todo lo anterior + eliminar sensores, gestionar usuarios |

---

## 📱 Funcionalidades

### 📡 Sensores
- Listado con filtros por ciudad
- Crear sensor (técnico/admin)
- Editar sensor (técnico/admin)
- Eliminar sensor (solo admin)
- Ver detalles

### 📊 Mediciones
- Historial de mediciones
- Filtros por sensor y ciudad
- Visualización de temperaturas con colores

### ⚙️ Procesos
- Catálogo de procesos disponibles
- Solicitar proceso (costo desde cuenta corriente)
- Ver estado de solicitudes
- Ver resultados de procesos completados

### 💬 Mensajería
- Chat privado entre usuarios
- Grupos de chat
- Historial de mensajes

### 💰 Cuenta Corriente
- Ver saldo
- Recargar saldo
- Historial de transacciones
- Ver facturas

### 👥 Gestión de Usuarios (Admin)
- Listar usuarios
- Crear usuarios
- Activar/desactivar cuentas
- Ver estado online

---

## 🚀 Instalación

### Requisitos
- Node.js 20+
- Docker y Docker Compose
- MongoDB
- PostgreSQL
- Redis

### Variables de Entorno
Crear archivo `.env` basado en `.env-template`:

```env
PORT=3000
FRONTEND_PORT=8080

# PostgreSQL
PG_HOST=postgres
PG_USER=user
PG_PASSWORD=passwd
PG_DATABASE=clima_db

# MongoDB
MONGO_HOST=mongo
MONGO_USER=user
MONGO_PASSWORD=passwd

# Redis
REDIS_HOST=redis

# Sesiones
JWT_SECRET=tu-secreto-seguro
SESSION_SECRET=otro-secreto-seguro
```

### Ejecución con Docker

```bash
# Construir y levantar
docker-compose up --build

# Ver logs
docker-compose logs -f backend

# Detener
docker-compose down
```

### Ejecución local (desarrollo)

```bash
cd backend
npm install
npm run dev
```

---

## 🔄 Flujo de Peticiones SSR

```
Usuario → Navegador → Formulario HTML → POST /sensores
                                              ↓
                              Servidor Express
                                              ↓
                              Controlador → SensorRepository
                                              ↓
                              res.render('sensores/index', { sensores })
                                              ↓
                              EJS genera HTML
                                              ↓
                              HTML enviado al navegador
                                              ↓
                              Navegador muestra página
```

---

## 🎨 Estilos

La aplicación usa CSS custom sin frameworks externos:
- Variables CSS para colores
- Diseño responsive
- Componentes: navbar, cards, tablas, formularios
- Badges para estados
- Alertas para mensajes flash

---

## 📦 Dependencias Principales

```json
{
  "ejs": "^3.1.10",           // Motor de templates
  "express": "^5.1.0",        // Framework web
  "express-session": "^1.18.2", // Manejo de sesiones
  "connect-redis": "^7.1.1",  // Store de sesiones
  "method-override": "^3.0.0", // PUT/DELETE desde forms
  "mongoose": "^8.20.0",      // ODM para MongoDB
  "pg": "^8.16.3",            // Cliente PostgreSQL
  "redis": "^4.6.10",         // Cliente Redis
  "bcryptjs": "^3.0.3"        // Hash de contraseñas
}
```

---

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Cookies HttpOnly
- Sesiones almacenadas en Redis
- Validación de roles en cada ruta protegida
- Sin exposición de datos sensibles en URLs

---

## 📝 Notas de Desarrollo

1. **Controladores**: Usan `res.render()` en lugar de `res.json()`
2. **Formularios**: POST para crear, PUT para editar (via method-override)
3. **Redirecciones**: Después de operaciones CRUD
4. **Flash messages**: Via `req.session.success` y `req.session.error`
5. **Datos en vistas**: Pasados como segundo parámetro de `render()`

---

## 🐛 Debugging

### Ver sesiones en Redis
```bash
docker exec -it clima_redis redis-cli
> KEYS sess:*
> GET "sess:xxx"
```

### Ver logs del backend
```bash
docker-compose logs -f backend
```

---

## 📚 Referencias

- [EJS Documentation](https://ejs.co/)
- [Express Session](https://www.npmjs.com/package/express-session)
- [Connect Redis](https://www.npmjs.com/package/connect-redis)
- [Method Override](https://www.npmjs.com/package/method-override)
