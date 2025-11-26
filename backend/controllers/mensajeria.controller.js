import { MensajeriaService } from '../services/mensajeria.service.js'; 
import * as UsuarioService from '../services/usuario.service.js';

// Listar conversaciones - SSR
export const listarConversaciones = async (req, res) => {
    try {
        const conversaciones = await MensajeriaService.listarChats(req.user.id);
        const chatActivo = req.query.chat || null;
        let mensajes = [];
        
        if (chatActivo) {
            mensajes = await MensajeriaService.verHistorial(chatActivo);
        }
        
        res.render('mensajeria/index', {
            title: 'Mensajería',
            conversaciones,
            chatActivo,
            mensajes
        });
    } catch (error) {
        req.session.error = error.message;
        res.render('mensajeria/index', {
            title: 'Mensajería',
            conversaciones: [],
            chatActivo: null,
            mensajes: []
        });
    }
};

// Mostrar formulario de nueva conversación
export const mostrarFormularioNuevo = async (req, res) => {
    try {
        const usuarios = await UsuarioService.obtenerTodos();
        
        res.render('mensajeria/nuevo', {
            title: 'Nueva Conversación',
            usuarios
        });
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/mensajeria');
    }
};

// Iniciar chat privado - SSR
export const iniciarPrivado = async (req, res) => {
    try {
        const { destinatarioId } = req.body;
        const chat = await MensajeriaService.iniciarChatPrivado(req.user.id, destinatarioId);
        res.redirect('/mensajeria?chat=' + chat._id);
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/mensajeria/nuevo');
    }
};

// Crear grupo - SSR
export const crearGrupo = async (req, res) => {
    try {
        let { participantesIds, nombre } = req.body;
        
        // Si es un string, convertir a array
        if (typeof participantesIds === 'string') {
            participantesIds = [participantesIds];
        }
        
        const grupo = await MensajeriaService.crearGrupo(req.user.id, participantesIds, nombre);
        res.redirect('/mensajeria?chat=' + grupo._id);
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/mensajeria/nuevo');
    }
};

// Enviar mensaje - SSR
export const enviar = async (req, res) => {
    try {
        const { texto } = req.body;
        const { id } = req.params;
        await MensajeriaService.enviarMensaje(id, req.user.id, texto);
        res.redirect('/mensajeria?chat=' + id);
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/mensajeria?chat=' + req.params.id);
    }
};

// Listar mis chats (JSON - para compatibilidad)
export const misChats = async (req, res) => {
    try {
        const chats = await MensajeriaService.listarChats(req.user.id);
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Historial de mensajes (JSON - para compatibilidad)
export const historial = async (req, res) => {
    try {
        const msgs = await MensajeriaService.verHistorial(req.params.id);
        res.json(msgs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};