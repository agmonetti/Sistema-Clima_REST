import * as IngestaService from '../services/ingesta.service.js';
import * as MedicionRepository from '../repositories/mongo/medicion.repository.js';
import * as SensorRepository from '../repositories/mongo/sensor.repository.js';

// Listar historial de mediciones - SSR
export const listarMediciones = async (req, res) => {
    try {
        const { sensorId, ciudad, page = 1 } = req.query;
        
        // Obtener sensores y ciudades para filtros
        const sensores = await SensorRepository.listarSensores();
        const ciudades = await SensorRepository.listarCiudades();
        
        let mediciones = [];
        
        if (sensorId) {
            // Si hay sensor seleccionado, obtener sus mediciones
            mediciones = await MedicionRepository.obtenerUltimasMediciones(sensorId, 20);
        } else if (ciudad) {
            // Si hay ciudad seleccionada, obtener sensores de esa ciudad y sus mediciones
            const sensoresCiudad = await SensorRepository.listarSensores(ciudad);
            if (sensoresCiudad.length > 0) {
                // Obtener mediciones del primer sensor de la ciudad
                mediciones = await MedicionRepository.obtenerUltimasMediciones(sensoresCiudad[0]._id, 20);
            }
        }
        
        res.render('mediciones/index', {
            title: 'Mediciones',
            mediciones,
            sensores,
            ciudades,
            sensorId: sensorId || '',
            ciudad: ciudad || '',
            page: parseInt(page)
        });
    } catch (error) {
        console.error('Error listando mediciones:', error);
        req.session.error = error.message;
        res.render('mediciones/index', {
            title: 'Mediciones',
            mediciones: [],
            sensores: [],
            ciudades: [],
            sensorId: '',
            ciudad: '',
            page: 1
        });
    }
};

// Registrar medición (endpoint para sensores - mantiene JSON)
export const registrarMedicion = async (req, res) => {
    try {
        const datos = req.body;

        console.log('[Controller] Recibida medición:', datos);

        if (!datos.sensor_id || datos.temperatura === undefined) {
            return res.status(400).json({ 
                error: 'Datos incompletos. Se requiere sensor_id y temperatura.' 
            });
        }

        const resultado = await IngestaService.procesarMedicion(datos);

        res.status(201).json({
            message: 'Medición registrada correctamente',
            data: {
                id: resultado._id,
                timestamp: resultado.timestamp
            }
        });

    } catch (error) {
        console.error('Error en el controlador de medición:', error.message);
        
        res.status(500).json({ 
            error: 'Error interno del servidor al procesar la medición.' 
        });
    }
};

export const listarSensores = async (req, res) => {
    try {
        const { ciudad } = req.query;
        const sensores = await MedicionRepository.listarSensores(ciudad);
        res.json(sensores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerCiudades = async (req, res) => {
    try {
        const ciudades = await MedicionRepository.listarCiudades();
        res.json(ciudades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const verHistorialSensor = async (req, res) => {
    try {
        const { sensorId } = req.params;
        const historial = await MedicionRepository.obtenerUltimasMediciones(sensorId);
        res.json(historial);
    } catch (error) {
        console.error('Error historial sensor:', error);
        res.status(500).json({ error: error.message });
    }
};