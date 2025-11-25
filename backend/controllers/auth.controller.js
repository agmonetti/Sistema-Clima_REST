import * as AuthService from '../services/auth.service.js';
import redisClient from '../config/redis.js'; // Asegúrate que la ruta sea correcta

// REGISTRO
export const register = async (req, res) => {
    try {
        const datos = req.body;
        const usuarioCreado = await AuthService.register(datos);
        res.status(201).json({
            message: 'Usuario registrado con éxito',
            data: usuarioCreado
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// LOGIN
export const login = async (req, res) => {
    try {
        const { mail, password } = req.body;
        const resultado = await AuthService.login({ mail, password });
        res.status(200).json(resultado);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

// HEARTBEAT (Latido)
export const latido = async (req, res) => {
    try {
        const userId = req.user.id;
        
        await redisClient.set(`ONLINE:${userId}`, '1', { EX: 60 });
        
        res.status(200).json({ status: 'OK' }); 

    } catch (error) {
        console.error("Redis Error:", error);
        // Respondemos OK aunque falle Redis para no romper el frontend
        res.status(200).json({ status: 'OK', warning: 'Redis unavailable' }); 
    }
};