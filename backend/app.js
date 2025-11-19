import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(express.json()); //imp porque vamos a enviar json data. 
//app.js verifica que sea json

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba simple
app.get('/', (req, res) => res.send('API Clima funcionando'));

export default app;