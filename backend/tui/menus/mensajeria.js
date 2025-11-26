/**
 * Menú de mensajería / chat
 */
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { MensajeriaService } from '../../services/mensajeria.service.js';
import * as UsuarioRepository from '../../repositories/postgres/usuario.repository.js';
import { session } from '../session.js';
import { limpiarPantalla, mostrarExito, mostrarError, mostrarInfo, mostrarSeparador } from '../utils/helpers.js';
import { crearTablaConversaciones } from '../utils/tablas.js';
import { ICONOS, TITULO } from '../utils/colores.js';

/**
 * Menú principal de mensajería
 */
export async function menuMensajeria() {
    while (true) {
        limpiarPantalla();
        console.log(TITULO(`\n${ICONOS.mensaje} MENSAJERÍA\n`));

        const { opcion } = await inquirer.prompt([
            {
                type: 'list',
                name: 'opcion',
                message: 'Selecciona una opción:',
                choices: [
                    { name: `${ICONOS.menu} Ver mis conversaciones`, value: 'listar' },
                    { name: `${ICONOS.usuario} Iniciar chat privado`, value: 'privado' },
                    { name: `${ICONOS.mensaje} Crear grupo`, value: 'grupo' },
                    { name: `${ICONOS.info} Ver mensajes de una conversación`, value: 'ver' },
                    { name: `${ICONOS.exito} Enviar mensaje`, value: 'enviar' },
                    new inquirer.Separator(),
                    { name: `${ICONOS.flecha} Volver al menú principal`, value: 'volver' }
                ]
            }
        ]);

        if (opcion === 'volver') return;

        switch (opcion) {
            case 'listar':
                await listarConversaciones();
                break;
            case 'privado':
                await iniciarChatPrivado();
                break;
            case 'grupo':
                await crearGrupo();
                break;
            case 'ver':
                await verMensajes();
                break;
            case 'enviar':
                await enviarMensaje();
                break;
        }
    }
}

/**
 * Listar conversaciones del usuario
 */
async function listarConversaciones() {
    limpiarPantalla();
    console.log(TITULO(`\n${ICONOS.mensaje} MIS CONVERSACIONES\n`));

    const spinner = ora('Cargando conversaciones...').start();

    try {
        const usuario = session.getUser();
        const conversaciones = await MensajeriaService.listarChats(usuario.id);
        
        if (!conversaciones || conversaciones.length === 0) {
            spinner.fail('No tienes conversaciones');
        } else {
            spinner.succeed(`${conversaciones.length} conversaciones`);
            console.log('\n' + crearTablaConversaciones(conversaciones));
        }

        await pausar();
    } catch (error) {
        spinner.fail('Error al cargar conversaciones');
        mostrarError(error.message);
        await pausar();
    }
}

/**
 * Iniciar un chat privado con otro usuario
 */
async function iniciarChatPrivado() {
    limpiarPantalla();
    console.log(TITULO(`\n${ICONOS.usuario} INICIAR CHAT PRIVADO\n`));

    const spinner = ora('Cargando usuarios...').start();

    try {
        const usuarios = await UsuarioRepository.obtenerTodos();
        const miId = session.getUserId();
        
        // Filtrar el usuario actual
        const otrosUsuarios = usuarios.filter(u => u.usuario_id !== miId && u.isActive);
        
        if (otrosUsuarios.length === 0) {
            spinner.fail('No hay otros usuarios disponibles');
            await pausar();
            return;
        }
        
        spinner.succeed(`${otrosUsuarios.length} usuarios disponibles`);

        const { otroUsuarioId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'otroUsuarioId',
                message: 'Selecciona un usuario:',
                choices: otrosUsuarios.map(u => ({
                    name: `${u.nombre} (${u.mail}) - ${u.rol}`,
                    value: u.usuario_id
                })),
                pageSize: 10
            }
        ]);

        const spinnerChat = ora('Iniciando chat...').start();
        const conversacion = await MensajeriaService.iniciarChatPrivado(miId, otroUsuarioId);
        
        spinnerChat.succeed('Chat iniciado exitosamente');
        mostrarExito(`ID de conversación: ${conversacion._id}`);
        
        await pausar();
    } catch (error) {
        mostrarError(error.message);
        await pausar();
    }
}

/**
 * Crear un grupo de chat
 */
async function crearGrupo() {
    limpiarPantalla();
    console.log(TITULO(`\n${ICONOS.mensaje} CREAR GRUPO\n`));

    const spinner = ora('Cargando usuarios...').start();

    try {
        const usuarios = await UsuarioRepository.obtenerTodos();
        const miId = session.getUserId();
        
        // Filtrar el usuario actual
        const otrosUsuarios = usuarios.filter(u => u.usuario_id !== miId && u.isActive);
        
        if (otrosUsuarios.length < 2) {
            spinner.fail('Se necesitan al menos 2 usuarios adicionales para crear un grupo');
            await pausar();
            return;
        }
        
        spinner.succeed(`${otrosUsuarios.length} usuarios disponibles`);

        const { nombreGrupo, participantes } = await inquirer.prompt([
            {
                type: 'input',
                name: 'nombreGrupo',
                message: 'Nombre del grupo:',
                validate: (input) => input ? true : 'El nombre es requerido'
            },
            {
                type: 'checkbox',
                name: 'participantes',
                message: 'Selecciona los participantes (mínimo 2):',
                choices: otrosUsuarios.map(u => ({
                    name: `${u.nombre} (${u.mail})`,
                    value: u.usuario_id
                })),
                validate: (input) => {
                    if (input.length < 2) return 'Selecciona al menos 2 participantes';
                    return true;
                }
            }
        ]);

        const spinnerGrupo = ora('Creando grupo...').start();
        const grupo = await MensajeriaService.crearGrupo(miId, participantes, nombreGrupo);
        
        spinnerGrupo.succeed('Grupo creado exitosamente');
        mostrarExito(`ID del grupo: ${grupo._id}`);
        
        await pausar();
    } catch (error) {
        mostrarError(error.message);
        await pausar();
    }
}

/**
 * Ver mensajes de una conversación
 */
async function verMensajes() {
    limpiarPantalla();
    console.log(TITULO(`\n${ICONOS.info} VER MENSAJES\n`));

    const spinner = ora('Cargando conversaciones...').start();

    try {
        const usuario = session.getUser();
        const conversaciones = await MensajeriaService.listarChats(usuario.id);
        
        if (!conversaciones || conversaciones.length === 0) {
            spinner.fail('No tienes conversaciones');
            await pausar();
            return;
        }
        
        spinner.succeed(`${conversaciones.length} conversaciones`);

        const { conversacionId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'conversacionId',
                message: 'Selecciona una conversación:',
                choices: conversaciones.map(c => ({
                    name: c.esGrupal ? `👥 ${c.nombre || 'Grupo'}` : `👤 Chat privado (${c.miembros?.length || 2} miembros)`,
                    value: c._id.toString()
                })),
                pageSize: 10
            }
        ]);

        const spinnerMsg = ora('Cargando mensajes...').start();
        const mensajes = await MensajeriaService.verHistorial(conversacionId);
        
        if (!mensajes || mensajes.length === 0) {
            spinnerMsg.fail('No hay mensajes en esta conversación');
        } else {
            spinnerMsg.succeed(`${mensajes.length} mensajes`);
            console.log('\n');
            mostrarSeparador();
            
            mensajes.forEach(msg => {
                const esPropio = msg.emisor_id?.toString() === usuario.id?.toString();
                const fecha = new Date(msg.timestamp).toLocaleString();
                const prefijo = esPropio ? chalk.green('Tú') : chalk.cyan(`Usuario ${msg.emisor_id?.toString()?.slice(-4) || 'Desconocido'}`);
                
                console.log(`${chalk.dim(fecha)} - ${prefijo}:`);
                console.log(`  ${msg.texto}\n`);
            });
            
            mostrarSeparador();
        }

        await pausar();
    } catch (error) {
        mostrarError(error.message);
        await pausar();
    }
}

/**
 * Enviar mensaje a una conversación
 */
async function enviarMensaje() {
    limpiarPantalla();
    console.log(TITULO(`\n${ICONOS.exito} ENVIAR MENSAJE\n`));

    const spinner = ora('Cargando conversaciones...').start();

    try {
        const usuario = session.getUser();
        const conversaciones = await MensajeriaService.listarChats(usuario.id);
        
        if (!conversaciones || conversaciones.length === 0) {
            spinner.fail('No tienes conversaciones. Inicia un chat primero.');
            await pausar();
            return;
        }
        
        spinner.succeed(`${conversaciones.length} conversaciones`);

        const { conversacionId, texto } = await inquirer.prompt([
            {
                type: 'list',
                name: 'conversacionId',
                message: 'Selecciona una conversación:',
                choices: conversaciones.map(c => ({
                    name: c.esGrupal ? `👥 ${c.nombre || 'Grupo'}` : `👤 Chat privado`,
                    value: c._id.toString()
                })),
                pageSize: 10
            },
            {
                type: 'input',
                name: 'texto',
                message: 'Escribe tu mensaje:',
                validate: (input) => input ? true : 'El mensaje no puede estar vacío'
            }
        ]);

        const spinnerEnvio = ora('Enviando mensaje...').start();
        await MensajeriaService.enviarMensaje(conversacionId, usuario.id, texto);
        
        spinnerEnvio.succeed('Mensaje enviado');
        
        await pausar();
    } catch (error) {
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
