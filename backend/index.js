import { connectMongo } from './config/mongo.js';
import { connectPostgres } from './config/postgres.js';
import { connectRedis } from './config/redis.js';
import { runMigrations } from './migrations/run-migrations.js';
import app from './app.js'; // <--- Importamos la app configurada

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('⏳ Iniciando servicios...');
    await connectMongo();
    await connectPostgres();
    await connectRedis();
    
    // Run database migrations
    await runMigrations();

    app.listen(PORT, () => {
      console.log(`[Backend] Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error crítico:', error);
    process.exit(1);
  }
};

startServer();