// Archivo: backend/repositories/mongo/medicion.repository.js
import Medicion from '../../models/mongo/Medicion.js';

//1. insertar datos


export async function crearMedicion(datos) {
    try {
        // Mongoose simplifica todo: .create() valida y guarda.
        const nuevaMedicion = await Medicion.create(datos);
        return nuevaMedicion;
    } catch (error) {
        throw new Error(`Error al guardar medición: ${error.message}`);
    }
}

//obtener el reporte de un sensor en un rango de fechas
export async function obtenerReporteRango(sensorId, fechaInicio, fechaFin) {
    try {
        const reporte = await Medicion.aggregate([
            {
                // filtramos por sensor y por rango de fechas
                $match: {
                    sensor_id: sensorId, 
                    timestamp: { 
                        $gte: new Date(fechaInicio), 
                        $lte: new Date(fechaFin)    
                    }
                }
            },
            {
                //  _id: null, agrupamos todo en un solo resultado
                $group: {
                    _id: null, 
                    tempPromedio: { $avg: "$temperatura" },
                    tempMaxima: { $max: "$temperatura" },   
                    tempMinima: { $min: "$temperatura" },   
                    cantMediciones: { $sum: 1 }             
                }
            }
        ]);

        // Mongo devuelve un array. Si está vacío, retornamos null.
        return reporte.length > 0 ? reporte[0] : null;

    } catch (error) {
        throw new Error(`Error generando reporte: ${error.message}`);
    }
}

//sirve para obtener las ultimas n mediciones de un sensor
export async function obtenerUltimasMediciones(sensorId, limite = 20) {
    try {
        const historial = await Medicion.find({ sensor_id: sensorId })
            .sort({ timestamp: -1 })
            .limit(limite);
            
        return historial;
    } catch (error) {
        throw new Error(`Error obteniendo historial: ${error.message}`);
    }
}