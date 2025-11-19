import { createClient } from 'redis';

const HOST = process.env.REDIS_HOST;
const PORT = process.env.REDIS_PORT;
const REDIS_URL = `redis://${HOST}:${PORT}`;

const client = createClient({
  url: REDIS_URL
});

client.on('error', (err) => console.error('❌ [Redis] Error del Cliente:', err));
// SOLO PRUEBA- DEPS ELIMINAR
export const connectRedis = async () => {
  try {
    await client.connect();
    console.log('🔴 [Redis] Conexión exitosa al servidor de caché');
  } catch (error) {
    console.error('❌ [Redis] Falló la conexión inicial:', error);
    process.exit(1); 
  }
};

export default client;
