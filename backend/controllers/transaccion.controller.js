import * as TransaccionService from '../services/transaccion.service.js';

// solicitudes de un proceso
export const solicitarProceso = async (req, res) => {
    try {
        //extraemos los datos del body
        const { usuario_id, proceso_id, parametros } = req.body;

        // validacion de datos
        if (!usuario_id || !proceso_id) {
            return res.status(400).json({ 
                error: 'Faltan datos obligatorios: usuario_id, proceso_id' 
            });
        }

        console.log(`Nueva solicitud recibida. Usuario: ${usuario_id}, Proceso: ${proceso_id}`);

        // llamamos al servicio
        const resultado = await TransaccionService.solicitarProceso({
            usuarioId: usuario_id,
            procesoId: proceso_id,
            parametros: parametros || {} 
        });

        res.status(200).json(resultado);

    } catch (error) {
        console.error('Error en la transacción:', error.message);
        
        // manejo de errores especificos
        if (error.message.includes('Saldo insuficiente') || error.message.includes('no existe')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Error interno procesando la solicitud.' });
    }
};

// verhistorial de procesos de un usuario
export const verHistorial = async (req, res) => {
    try {
        const { usuarioId } = req.params; // Viene de la URL
        
        const historial = await TransaccionService.obtenerHistorial(usuarioId);
        
        res.status(200).json(historial);
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({ error: 'Error al obtener el historial.' });
    }
};