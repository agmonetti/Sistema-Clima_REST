/**
 * Menú de cuenta corriente y facturación
 */
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as TransaccionService from '../../services/transaccion.service.js';
import { session } from '../session.js';
import { limpiarPantalla, mostrarExito, mostrarError, mostrarInfo, mostrarCaja } from '../utils/helpers.js';
import { crearTablaHistorial } from '../utils/tablas.js';
import { ICONOS, TITULO, colorearSaldo } from '../utils/colores.js';

/**
 * Menú principal de transacciones
 */
export async function menuTransacciones() {
    while (true) {
        limpiarPantalla();
        console.log(TITULO(`\n${ICONOS.dinero} MI CUENTA\n`));

        const usuario = session.getUser();
        console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(`  ${ICONOS.usuario} Usuario: ${chalk.bold(usuario.nombre)}`);
        console.log(`  ${ICONOS.dinero} Saldo actual: ${colorearSaldo(usuario.saldoActual)}`);
        console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

        const { opcion } = await inquirer.prompt([
            {
                type: 'list',
                name: 'opcion',
                message: 'Selecciona una opción:',
                choices: [
                    { name: `${ICONOS.dinero} Ver saldo actual`, value: 'saldo' },
                    { name: `${ICONOS.exito} Cargar dinero`, value: 'cargar' },
                    { name: `${ICONOS.menu} Ver historial de transacciones`, value: 'historial' },
                    new inquirer.Separator(),
                    { name: `${ICONOS.flecha} Volver al menú principal`, value: 'volver' }
                ]
            }
        ]);

        if (opcion === 'volver') return;

        switch (opcion) {
            case 'saldo':
                await verSaldo();
                break;
            case 'cargar':
                await cargarDinero();
                break;
            case 'historial':
                await verHistorial();
                break;
        }
    }
}

/**
 * Ver saldo actual
 */
async function verSaldo() {
    limpiarPantalla();
    console.log(TITULO(`\n${ICONOS.dinero} MI SALDO\n`));

    const spinner = ora('Consultando saldo...').start();

    try {
        const usuario = session.getUser();
        const saldo = await TransaccionService.getSaldo(usuario.id);
        
        // Actualizar sesión
        session.actualizarSaldo(saldo);
        
        spinner.succeed('Saldo obtenido');
        
        console.log('\n');
        mostrarCaja(
            `${ICONOS.dinero} SALDO DISPONIBLE\n\n` +
            chalk.green.bold(`$${saldo || 0}`),
            { borderColor: 'green', padding: 1 }
        );

        await pausar();
    } catch (error) {
        spinner.fail('Error al consultar saldo');
        mostrarError(error.message);
        await pausar();
    }
}

/**
 * Cargar dinero a la cuenta
 */
async function cargarDinero() {
    limpiarPantalla();
    console.log(TITULO(`\n${ICONOS.exito} CARGAR DINERO\n`));

    const usuario = session.getUser();
    console.log(chalk.dim(`Saldo actual: ${colorearSaldo(usuario.saldoActual)}\n`));

    const { monto } = await inquirer.prompt([
        {
            type: 'number',
            name: 'monto',
            message: 'Monto a cargar ($):',
            validate: (input) => {
                if (isNaN(input)) return 'Ingresa un número válido';
                if (input <= 0) return 'El monto debe ser positivo';
                if (input > 10000) return 'El monto máximo es $10.000';
                return true;
            }
        }
    ]);

    const { confirmar } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmar',
            message: `¿Confirmas la carga de $${monto}?`,
            default: true
        }
    ]);

    if (!confirmar) {
        mostrarInfo('Operación cancelada');
        await pausar();
        return;
    }

    const spinner = ora('Procesando recarga...').start();

    try {
        const nuevoSaldo = await TransaccionService.cargarDinero(usuario.id, monto);
        
        // Actualizar sesión
        session.actualizarSaldo(nuevoSaldo);
        
        spinner.succeed('Recarga exitosa');
        
        console.log('\n');
        mostrarCaja(
            `${ICONOS.exito} RECARGA COMPLETADA\n\n` +
            `Monto cargado: ${chalk.green('$' + monto)}\n` +
            `Nuevo saldo: ${colorearSaldo(nuevoSaldo)}`,
            { borderColor: 'green', padding: 1 }
        );

        await pausar();
    } catch (error) {
        spinner.fail('Error al cargar dinero');
        mostrarError(error.message);
        await pausar();
    }
}

/**
 * Ver historial de transacciones
 */
async function verHistorial() {
    limpiarPantalla();
    console.log(TITULO(`\n${ICONOS.menu} HISTORIAL DE TRANSACCIONES\n`));

    const spinner = ora('Cargando historial...').start();

    try {
        const usuario = session.getUser();
        const historial = await TransaccionService.obtenerHistorial(usuario.id);
        
        if (!historial || historial.length === 0) {
            spinner.fail('No tienes transacciones');
            mostrarInfo('Aún no has realizado ninguna solicitud de proceso');
        } else {
            spinner.succeed(`${historial.length} transacciones`);
            console.log('\n' + crearTablaHistorial(historial));
            
            // Mostrar resumen
            const totalGastado = historial
                .filter(h => h.estado !== 'REEMBOLSADO')
                .reduce((sum, h) => sum + (h.costo || 0), 0);
            
            console.log(chalk.dim(`\nTotal gastado en procesos: $${totalGastado}`));
        }

        await pausar();
    } catch (error) {
        spinner.fail('Error al cargar historial');
        mostrarError(error.message);
        await pausar();
    }
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
