import * as TransaccionService from '../services/transaccion.service.js';

// solicitudes de un proceso
export const solicitarProceso = async (req, res) => {
    try {
        //extraemos los datos del body
        const usuarioId = req.user.id; 
        const { procesoId, parametros } = req.body; 
        // validacion de datos
        if (!procesoId) {
            return res.status(400).json({ 
                error: 'Faltan datos obligatorios: usuario_id, proceso_id' 
            });
        }

        console.log(`Nueva solicitud recibida. Usuario: ${usuarioId}, Proceso: ${procesoId}`);

        // llamamos al servicio
        const resultado = await TransaccionService.solicitarProceso({
            usuarioId: usuarioId,
            procesoId: procesoId,
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
// obtener saldo actual
export const obtenerSaldo = async (req, res) => {
    try {
        const userId = req.user.id; 
        const saldo = await TransaccionService.getSaldo(userId);
        res.json({ saldo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// recargar saldo
export const recargar = async (req, res) => {
    try {
        const userId = req.user.id;
        const { monto } = req.body; 

        const nuevoSaldo = await TransaccionService.cargarDinero(userId, parseFloat(monto));
        
        res.json({ 
            message: "Carga exitosa", 
            nuevoSaldo: nuevoSaldo 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};