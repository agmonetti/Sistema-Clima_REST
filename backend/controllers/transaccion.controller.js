import * as TransaccionService from '../services/transaccion.service.js';

// Listar cuenta y transacciones - SSR
export const listarTransacciones = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const saldo = await TransaccionService.getSaldo(usuarioId);
        const historial = await TransaccionService.obtenerHistorial(usuarioId);
        
        res.render('transacciones/index', {
            title: 'Mi Cuenta',
            saldo,
            historial
        });
    } catch (error) {
        req.session.error = error.message;
        res.render('transacciones/index', {
            title: 'Mi Cuenta',
            saldo: 0,
            historial: []
        });
    }
};

// Mostrar formulario de recarga
export const mostrarFormularioPagar = async (req, res) => {
    try {
        const saldo = await TransaccionService.getSaldo(req.user.id);
        
        res.render('transacciones/pagar', {
            title: 'Recargar Saldo',
            saldo
        });
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/transacciones');
    }
};

// Ver factura
export const verFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const historial = await TransaccionService.obtenerHistorial(req.user.id);
        const factura = historial.find(h => h.factura_id === parseInt(id));
        
        if (!factura) {
            req.session.error = 'Factura no encontrada';
            return res.redirect('/transacciones');
        }
        
        res.render('transacciones/factura', {
            title: 'Factura #' + id,
            factura
        });
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/transacciones');
    }
};

// Solicitar proceso - SSR
export const solicitarProceso = async (req, res) => {
    try {
        const usuarioId = req.user.id; 
        const { procesoId, parametros } = req.body; 
        
        if (!procesoId) {
            req.session.error = 'Faltan datos obligatorios';
            return res.redirect('/procesos');
        }

        const resultado = await TransaccionService.solicitarProceso({
            usuarioId: usuarioId,
            procesoId: procesoId,
            parametros: parametros || {} 
        });

        req.session.success = `Proceso solicitado exitosamente. Solicitud #${resultado.ticket.solicitud_id}`;
        res.redirect('/procesos/' + resultado.ticket.solicitud_id);

    } catch (error) {
        console.error('Error en la transacción:', error.message);
        req.session.error = error.message;
        res.redirect('/procesos');
    }
};

// Ver historial - SSR
export const verHistorial = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const historial = await TransaccionService.obtenerHistorial(usuarioId);
        res.json(historial);
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({ error: 'Error al obtener el historial.' });
    }
};

// Obtener saldo - JSON
export const obtenerSaldo = async (req, res) => {
    try {
        const userId = req.user.id; 
        const saldo = await TransaccionService.getSaldo(userId);
        res.json({ saldo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Recargar saldo - SSR
export const recargar = async (req, res) => {
    try {
        const userId = req.user.id;
        const { monto } = req.body; 

        const nuevoSaldo = await TransaccionService.cargarDinero(userId, parseFloat(monto));
        
        req.session.success = `Recarga exitosa. Nuevo saldo: $${nuevoSaldo.toFixed(2)}`;
        res.redirect('/transacciones');
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/transacciones/pagar');
    }
};