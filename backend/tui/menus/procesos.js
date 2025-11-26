/**
 * Menú de gestión de procesos
 * Catálogo, solicitud de procesos y historial
 */
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as ProcesoRepository from '../../repositories/mongo/proceso.repository.js';
import * as TransaccionService from '../../services/transaccion.service.js';
import * as MedicionRepository from '../../repositories/mongo/medicion.repository.js';
import { session } from '../session.js';
import { limpiarPantalla, mostrarExito, mostrarError, mostrarInfo, mostrarCaja } from '../utils/helpers.js';
import { crearTablaProcesos, crearTablaHistorial } from '../utils/tablas.js';
import { ICONOS, TITULO, colorearSaldo, colorearTemperatura } from '../utils/colores.js';

/**
 * Menú principal de procesos
 */
export async function menuProcesos() {
    while (true) {
        limpiarPantalla();
        console.log(TITULO(`\n${ICONOS.proceso} PROCESOS Y SERVICIOS\n`));

        const usuario = session.getUser();
        console.log(chalk.dim(`Saldo actual: ${colorearSaldo(usuario.saldoActual)}\n`));

        const { opcion } = await inquirer.prompt([
            {
                type: 'list',
                name: 'opcion',
                message: 'Selecciona una opción:',
                choices: [
                    { name: `${ICONOS.menu} Ver catálogo de procesos`, value: 'catalogo' },
                    { name: `${ICONOS.proceso} Solicitar proceso`, value: 'solicitar' },
                    { name: `${ICONOS.info} Ver mi historial`, value: 'historial' },
                    new inquirer.Separator(),
                    { name: `${ICONOS.flecha} Volver al menú principal`, value: 'volver' }
                ]
            }
        ]);

        if (opcion === 'volver') return;

        switch (opcion) {
            case 'catalogo':
                await verCatalogo();
                break;
            case 'solicitar':
                await solicitarProceso();
                break;
            case 'historial':
                await verHistorial();
                break;
        }
    }
}

/**
 * Ver catálogo de procesos disponibles
 */
async function verCatalogo() {
    limpiarPantalla();
    console.log(TITULO(`\n${ICONOS.menu} CATÁLOGO DE PROCESOS\n`));

    const spinner = ora('Cargando catálogo...').start();

    try {
        const procesos = await ProcesoRepository.listarProcesos();
        
        if (procesos.length === 0) {
            spinner.fail('No hay procesos disponibles');
        } else {
            spinner.succeed(`${procesos.length} procesos disponibles`);
            console.log('\n' + crearTablaProcesos(procesos));
        }

        await pausar();
    } catch (error) {
        spinner.fail('Error al cargar catálogo');
        mostrarError(error.message);
        await pausar();
    }
}

/**
 * Solicitar un proceso
 */
async function solicitarProceso() {
    limpiarPantalla();
    console.log(TITULO(`\n${ICONOS.proceso} SOLICITAR PROCESO\n`));

    const spinner = ora('Cargando procesos disponibles...').start();

    try {
        const procesos = await ProcesoRepository.listarProcesos();
        const sensores = await MedicionRepository.listarSensores();
        
        if (procesos.length === 0) {
            spinner.fail('No hay procesos disponibles');
            await pausar();
            return;
        }
        
        spinner.succeed('Procesos cargados');

        const usuario = session.getUser();
        console.log(chalk.dim(`\nTu saldo actual: ${colorearSaldo(usuario.saldoActual)}\n`));

        // Seleccionar proceso
        const { procesoId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'procesoId',
                message: 'Selecciona el proceso a ejecutar:',
                choices: procesos.map(p => ({
                    name: `${p.nombre} - $${p.costo} - ${p.descripcion || ''}`,
                    value: p._id.toString()
                })),
                pageSize: 10
            }
        ]);

        const procesoSeleccionado = procesos.find(p => p._id.toString() === procesoId);
        
        // Verificar saldo
        if (usuario.saldoActual < procesoSeleccionado.costo) {
            mostrarError(`Saldo insuficiente. Necesitas $${procesoSeleccionado.costo} y tienes $${usuario.saldoActual}`);
            await pausar();
            return;
        }

        // Obtener parámetros según el proceso
        const parametros = await obtenerParametrosProceso(procesoSeleccionado.codigo, sensores);
        
        if (!parametros) {
            mostrarInfo('Operación cancelada');
            await pausar();
            return;
        }

        // Confirmar ejecución
        const { confirmar } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmar',
                message: `¿Confirmas ejecutar "${procesoSeleccionado.nombre}" por $${procesoSeleccionado.costo}?`,
                default: true
            }
        ]);

        if (!confirmar) {
            mostrarInfo('Operación cancelada');
            await pausar();
            return;
        }

        // Ejecutar proceso
        const spinnerEjec = ora('Ejecutando proceso...').start();

        const resultado = await TransaccionService.solicitarProceso({
            usuarioId: usuario.id,
            procesoId: procesoId,
            parametros: parametros
        });

        spinnerEjec.succeed('Proceso ejecutado exitosamente');

        // Actualizar saldo en sesión
        const nuevoSaldo = await TransaccionService.getSaldo(usuario.id);
        session.actualizarSaldo(nuevoSaldo);

        // Mostrar resultado
        console.log('\n');
        mostrarCaja(
            chalk.green.bold('✓ RESULTADO DEL PROCESO\n\n') +
            `Ticket: #${resultado.ticket.solicitud_id}\n` +
            `Servicio: ${resultado.ticket.servicio}\n` +
            `Costo: $${resultado.ticket.costo}\n\n` +
            formatearResultado(resultado.data),
            { borderColor: 'green' }
        );

        await pausar();
    } catch (error) {
        mostrarError(error.message);
        await pausar();
    }
}

/**
 * Obtiene los parámetros necesarios según el código del proceso
 */
async function obtenerParametrosProceso(codigo, sensores) {
    if (sensores.length === 0) {
        mostrarError('No hay sensores disponibles para procesar');
        return null;
    }

    const sensorChoices = sensores.map(s => ({
        name: `${s.nombre} - ${s.ubicacion?.ciudad || 'N/A'}`,
        value: s._id.toString()
    }));

    switch (codigo) {
        case 'INFORME_MAXIMAS_MINIMAS':
        case 'INFORME_PROMEDIOS':
        case 'ANALISIS_DESVIACION':
            return await inquirer.prompt([
                {
                    type: 'list',
                    name: 'sensorId',
                    message: 'Selecciona un sensor:',
                    choices: sensorChoices
                },
                {
                    type: 'input',
                    name: 'fechaInicio',
                    message: 'Fecha inicio (YYYY-MM-DD):',
                    default: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    validate: validarFecha
                },
                {
                    type: 'input',
                    name: 'fechaFin',
                    message: 'Fecha fin (YYYY-MM-DD):',
                    default: new Date().toISOString().split('T')[0],
                    validate: validarFecha
                }
            ]);

        case 'CONSULTAR_DATOS':
        case 'CHECK_SALUD':
            return await inquirer.prompt([
                {
                    type: 'list',
                    name: 'sensorId',
                    message: 'Selecciona un sensor:',
                    choices: sensorChoices
                }
            ]);

        case 'BUSCAR_ALERTAS':
            return await inquirer.prompt([
                {
                    type: 'list',
                    name: 'sensorId',
                    message: 'Selecciona un sensor:',
                    choices: sensorChoices
                },
                {
                    type: 'list',
                    name: 'variable',
                    message: 'Variable:',
                    choices: [
                        { name: 'Temperatura', value: 'temperatura' },
                        { name: 'Humedad', value: 'humedad' }
                    ]
                },
                {
                    type: 'list',
                    name: 'operador',
                    message: 'Condición:',
                    choices: [
                        { name: 'Mayor que', value: 'mayor' },
                        { name: 'Menor que', value: 'menor' }
                    ]
                },
                {
                    type: 'number',
                    name: 'umbral',
                    message: 'Valor umbral:',
                    validate: (input) => !isNaN(input) ? true : 'Debe ser un número'
                }
            ]);

        default:
            return await inquirer.prompt([
                {
                    type: 'list',
                    name: 'sensorId',
                    message: 'Selecciona un sensor:',
                    choices: sensorChoices
                }
            ]);
    }
}

/**
 * Formatea el resultado del proceso para mostrar
 */
function formatearResultado(data) {
    if (!data) return 'Sin datos';
    
    if (Array.isArray(data)) {
        return `Se encontraron ${data.length} registros`;
    }
    
    return Object.entries(data)
        .map(([key, value]) => {
            if (typeof value === 'number') {
                if (key.toLowerCase().includes('temp')) {
                    return `${key}: ${colorearTemperatura(value.toFixed(2))}`;
                }
                return `${key}: ${value.toFixed(2)}`;
            }
            return `${key}: ${value}`;
        })
        .join('\n');
}

/**
 * Ver historial de procesos del usuario
 */
async function verHistorial() {
    limpiarPantalla();
    console.log(TITULO(`\n${ICONOS.info} MI HISTORIAL DE PROCESOS\n`));

    const spinner = ora('Cargando historial...').start();

    try {
        const usuario = session.getUser();
        const historial = await TransaccionService.obtenerHistorial(usuario.id);
        
        if (!historial || historial.length === 0) {
            spinner.fail('No tienes procesos en tu historial');
        } else {
            spinner.succeed(`${historial.length} procesos en tu historial`);
            console.log('\n' + crearTablaHistorial(historial));
        }

        await pausar();
    } catch (error) {
        spinner.fail('Error al cargar historial');
        mostrarError(error.message);
        await pausar();
    }
}

/**
 * Valida formato de fecha
 */
function validarFecha(input) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(input)) return 'Formato inválido. Usa YYYY-MM-DD';
    const fecha = new Date(input);
    if (isNaN(fecha.getTime())) return 'Fecha inválida';
    return true;
}

/**
 * Función auxiliar para pausar
 */
async function pausar() {
    await inquirer.prompt([{
        type: 'input',
        name: 'pausa',
        message: chalk.dim('Presiona Enter para continuar...')
    }]);
}
