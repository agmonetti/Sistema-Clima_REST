import express from 'express';
import { connectMongo } from './config/mongo.js';
import { connectPostgres } from './config/postgres.js';
import { connectRedis } from './config/redis.js'; 

const app = express();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('⏳ Iniciando servicios...');

    // Conectamos las 3 bases de datos en paralelo o serie
    await connectMongo();
    await connectPostgres();
    await connectRedis(); // <--- Conectar Redis

    // Levantar el servidor
    app.listen(PORT, () => {
      console.log(`✅ [Backend] Servidor corriendo en http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('🔥 Error crítico al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();