import Proceso from '../../models/mongo/Proceso.js';

// Recuperar los detalles de un proceso específico.

export async function obtenerProcesoPorId(id) {
    try {
        const proceso = await Proceso.findById(id);
        
        if (!proceso) {
            throw new Error('El proceso solicitado no existe en el catálogo');
        }
        
        return proceso;
    } catch (error) {
        throw new Error(`Error al buscar proceso: ${error.message}`);
    }
}

//Mostrar al usuario qué opciones tiene disponibles.

export async function listarProcesos() {
    try {
        const procesos = await Proceso.find({}).lean();
        
        return procesos;
    } catch (error) {
        throw new Error(`Error al listar procesos: ${error.message}`);
    }
}