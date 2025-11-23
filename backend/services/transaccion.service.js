import * as ProcesoRepository from '../repositories/mongo/proceso.repository.js';
import * as TransaccionRepository from '../repositories/postgres/transaccion.repository.js';
import * as MedicionRepository from '../repositories/mongo/medicion.repository.js';

export async function solicitarProceso({ usuarioId, procesoId, parametros }) {
    
    // buscamos si el proceso existe
    console.log(`Buscando proceso ${procesoId}...`);
    const proceso = await ProcesoRepository.obtenerProcesoPorId(procesoId);
    
    if (!proceso) {
        throw new Error('El proceso solicitado no existe.');
    }

    // siel usuario no tiene el dinero suficiente no seguimos
    const ticket = await TransaccionRepository.crearSolicitudConFactura({
        usuarioId,
        procesoIdMongo: procesoId,
        costo: proceso.costo
    });

    console.log(`Cobrado. Solicitud #${ticket.solicitud_id}. Ejecutando lógica...`);

    // ejecutamos el proceso solicitado
    let resultadoDelProceso = null;

    try {
        console.log("🔀 Ejecutando switch para código:", proceso.codigo);
        switch (proceso.codigo) {
            case 'INFORME_MAXIMAS_MINIMAS':
                if (!parametros?.sensorId || !parametros?.fechaInicio || !parametros?.fechaFin) {
                    throw new Error('Faltan parámetros: sensorId, fechaInicio, fechaFin');
                }
                const rawMaxMin = await MedicionRepository.obtenerReporteRango(
                    parametros.sensorId,
                    parametros.fechaInicio,
                    parametros.fechaFin
                );
                
                if (rawMaxMin) {
                    resultadoDelProceso = {
                        tempMaxima: rawMaxMin.tempMaxima,
                        tempMinima: rawMaxMin.tempMinima,
                        cantMediciones: rawMaxMin.cantMediciones
                    };
                }
                break;

            case 'INFORME_PROMEDIOS':
                if (!parametros?.sensorId || !parametros?.fechaInicio || !parametros?.fechaFin) {
                    throw new Error('Faltan parámetros: sensorId, fechaInicio, fechaFin');
                }
                const rawProm = await MedicionRepository.obtenerReporteRango(
                    parametros.sensorId,
                    parametros.fechaInicio,
                    parametros.fechaFin
                );

                if (rawProm) {
                    resultadoDelProceso = {
                        tempPromedio: rawProm.tempPromedio,
                        cantMediciones: rawProm.cantMediciones
                    };
                }
                break;

            case 'CONSULTAR_DATOS':
                 if (!parametros?.sensorId) throw new Error('Falta parámetro: sensorId');
                resultadoDelProceso = await MedicionRepository.obtenerUltimasMediciones(parametros.sensorId);
                break;

            case 'BUSCAR_ALERTAS': 
                 if (!parametros?.sensorId || !parametros?.umbral) throw new Error('Faltan: sensorId, umbral');
                 
                 resultadoDelProceso = await MedicionRepository.buscarAlertas({
                    sensorIds: parametros.sensorId, 
                    umbral: parametros.umbral,
                    variable: parametros.variable || 'temperatura',
                    operador: parametros.operador || 'mayor',
                    fechaInicio: parametros.fechaInicio,
                    fechaFin: parametros.fechaFin
                 });
                 break;

            default:
                resultadoDelProceso = { mensaje: "Proceso registrado. Ejecución diferida." };
                break;
        }
        console.log("📊 RESULTADO BRUTO DE MONGO:", resultadoDelProceso);

    } catch (logicError) {
        // si fallo la ejecucion del proceso, se reembolsa al usuario
        console.error("Falló la ejecución. Iniciando reembolso...", logicError.message);

        await TransaccionRepository.reembolsarSolicitud(
            ticket.solicitud_id,
            usuarioId,
            proceso.costo,
            logicError.message 
        );

        
        throw new Error(`Error en el proceso: ${logicError.message}. Tu saldo ha sido reembolsado.`);
    }
    
    if (resultadoDelProceso) {
            await TransaccionRepository.guardarResultadoExitoso(
                ticket.solicitud_id, 
                resultadoDelProceso
            );
        }
    return {
        status: 'success',
        ticket: {
            solicitud_id: ticket.solicitud_id,
            servicio: proceso.nombre,
            costo: proceso.costo
        },
        data: resultadoDelProceso
    };
}

export async function obtenerHistorial(usuarioId) {
    return await TransaccionRepository.obtenerHistorialUsuario(usuarioId);
}

export async function getSaldo(usuarioId) {
    return await TransaccionRepository.obtenerSaldo(usuarioId);
}

export async function cargarDinero(usuarioId, monto) {
    // Validación de negocio
    if (!monto || monto <= 0) {
        throw new Error("El monto a recargar debe ser positivo");
    }
    
    // Delegamos al repo
    const nuevoSaldo = await TransaccionRepository.recargarSaldo(usuarioId, monto);
    return nuevoSaldo;
}