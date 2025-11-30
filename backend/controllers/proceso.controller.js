import * as ProcesoRepository from '../repositories/mongo/proceso.repository.js';
import * as TransaccionService from '../services/transaccion.service.js';
import * as SensorRepository from '../repositories/mongo/sensor.repository.js';
import * as TransaccionRepository from '../repositories/postgres/transaccion.repository.js';

// Listar catálogo y solicitudes - SSR
export const listarProcesos = async (req, res) => {
    try {
        const procesos = await ProcesoRepository.listarProcesos();
        const solicitudes = await TransaccionRepository.obtenerHistorialUsuario(req.user.id);
        
        res.render('procesos/index', {
            title: 'Procesos',
            procesos,
            solicitudes
        });
    } catch (error) {
        req.session.error = error.message;
        res.render('procesos/index', {
            title: 'Procesos',
            procesos: [],
            solicitudes: []
        });
    }
};

// Mostrar formulario de solicitud
export const mostrarFormularioSolicitar = async (req, res) => {
    try {
        const { procesoId } = req.query;
        
        if (!procesoId) {
            req.session.error = 'Debe seleccionar un proceso';
            return res.redirect('/procesos');
        }
        
        const proceso = await ProcesoRepository.obtenerProcesoPorId(procesoId);
        const sensores = await SensorRepository.listarSensores();
        
        res.render('procesos/solicitar', {
            title: 'Solicitar Proceso',
            proceso,
            sensores
        });
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/procesos');
    }
};

// Procesar solicitud - SSR
export const solicitarProceso = async (req, res) => {
    try {
        const { procesoId, sensorId, fechaInicio, fechaFin, variable, umbral, operador } = req.body;
        
        const parametros = {};
        if (sensorId) parametros.sensorId = sensorId;
        if (fechaInicio) parametros.fechaInicio = fechaInicio;
        if (fechaFin) parametros.fechaFin = fechaFin;
        if (variable) parametros.variable = variable;
        if (umbral) parametros.umbral = parseFloat(umbral);
        if (operador) parametros.operador = operador;
        
        const resultado = await TransaccionService.solicitarProceso({
            usuarioId: req.user.id,
            procesoId,
            parametros
        });
        
        req.session.success = `Proceso solicitado exitosamente. Solicitud #${resultado.ticket.solicitud_id}`;
        res.redirect('/procesos/' + resultado.ticket.solicitud_id);
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/procesos');
    }
};

// Ver detalle de solicitud - SSR
export const verDetalleSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const historial = await TransaccionRepository.obtenerHistorialUsuario(req.user.id);
        const solicitud = historial.find(s => s.solicitud_id === parseInt(id));
        
        if (!solicitud) {
            req.session.error = 'Solicitud no encontrada';
            return res.redirect('/procesos');
        }
        
        res.render('procesos/detalle', {
            title: 'Detalle de Solicitud',
            solicitud
        });
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/procesos');
    }
};

// Listar catálogo (mantener para compatibilidad)
export const listarCatalogo = async (req, res) => {
    try {
        const procesos = await ProcesoRepository.listarProcesos();
        res.json(procesos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
