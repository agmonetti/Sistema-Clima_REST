import Sensor from '../../models/mongo/Sensor.js';

// Listar todos los sensores con filtro opcional
export async function listarSensores(ciudad = null) {
    try {
        const filtro = {};
        if (ciudad) {
            filtro['ubicacion.ciudad'] = ciudad;
        }
        return await Sensor.find(filtro).lean();
    } catch (error) {
        throw new Error(`Error listando sensores: ${error.message}`);
    }
}

// Obtener sensor por ID
export async function obtenerPorId(id) {
    try {
        return await Sensor.findById(id).lean();
    } catch (error) {
        throw new Error(`Error obteniendo sensor: ${error.message}`);
    }
}

// Crear nuevo sensor
export async function crear(datos) {
    try {
        const sensor = new Sensor(datos);
        return await sensor.save();
    } catch (error) {
        throw new Error(`Error creando sensor: ${error.message}`);
    }
}

// Actualizar sensor
export async function actualizar(id, datos) {
    try {
        return await Sensor.findByIdAndUpdate(id, datos, { new: true });
    } catch (error) {
        throw new Error(`Error actualizando sensor: ${error.message}`);
    }
}

// Eliminar sensor
export async function eliminar(id) {
    try {
        return await Sensor.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(`Error eliminando sensor: ${error.message}`);
    }
}

// Listar ciudades únicas
export async function listarCiudades() {
    try {
        return await Sensor.distinct('ubicacion.ciudad');
    } catch (error) {
        throw new Error(`Error listando ciudades: ${error.message}`);
    }
}
