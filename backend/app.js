import express from 'express';
import session from 'express-session';
import RedisStore from 'connect-redis';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import redisClient from './config/redis.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import medicionRoutes from './routes/medicion.routes.js';
import transaccionRoutes from './routes/transaccion.routes.js';
import userRoutes from './routes/usuario.routes.js';
import mensajeriaRoutes from './routes/mensajeria.routes.js';
import procesoRoutes from './routes/proceso.routes.js';
import sensorRoutes from './routes/sensor.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// View engine setup - EJS for Server-Side Rendering
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Middleware para parsear formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override para soportar PUT y DELETE desde formularios HTML
app.use(methodOverride('_method'));

// Archivos estáticos
app.use(express.static(join(__dirname, 'public')));

// Configuración de sesiones con Redis
const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'sess:'
});

app.use(session({
    store: redisStore,
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'clima-app-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Middleware para pasar datos de sesión a todas las vistas
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success = req.session.success;
    res.locals.error = req.session.error;
    // Limpiar mensajes flash después de usarlos
    delete req.session.success;
    delete req.session.error;
    next();
});

// Rutas - Sin prefijo /api/ (SSR)
app.use('/auth', authRoutes);
app.use('/mediciones', medicionRoutes);
app.use('/transacciones', transaccionRoutes);
app.use('/usuarios', userRoutes);
app.use('/mensajeria', mensajeriaRoutes);
app.use('/procesos', procesoRoutes);
app.use('/sensores', sensorRoutes);

// Página principal
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/sensores');
    } else {
        res.redirect('/auth/login');
    }
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).render('404', { 
        title: 'Página no encontrada',
        message: 'La página que buscas no existe'
    });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).render('error', {
        title: 'Error',
        message: err.message || 'Ha ocurrido un error interno',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

export default app;
