import * as SensorRepository from '../repositories/mongo/sensor.repository.js';

// Listar todos los sensores - SSR
export const getAllSensors = async (req, res) => {
    try {
        const { ciudad } = req.query;
        const sensores = await SensorRepository.listarSensores(ciudad);
        const ciudades = await SensorRepository.listarCiudades();
        
        res.render('sensores/index', {
            title: 'Sensores',
            sensores,
            ciudades,
            ciudad: ciudad || ''
        });
    } catch (error) {
        console.error('Error listando sensores:', error);
        req.session.error = error.message;
        res.render('sensores/index', {
            title: 'Sensores',
            sensores: [],
            ciudades: [],
            ciudad: ''
        });
    }
};

// Mostrar formulario de nuevo sensor
export const mostrarFormularioNuevo = (req, res) => {
    res.render('sensores/nuevo', { title: 'Nuevo Sensor' });
};

// Mostrar detalle de sensor
export const getSensorById = async (req, res) => {
    try {
        const { id } = req.params;
        const sensor = await SensorRepository.obtenerPorId(id);
        
        if (!sensor) {
            req.session.error = 'Sensor no encontrado';
            return res.redirect('/sensores');
        }
        
        res.render('sensores/detalle', {
            title: sensor.nombre,
            sensor
        });
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/sensores');
    }
};

// Mostrar formulario de edición
export const mostrarFormularioEditar = async (req, res) => {
    try {
        const { id } = req.params;
        const sensor = await SensorRepository.obtenerPorId(id);
        
        if (!sensor) {
            req.session.error = 'Sensor no encontrado';
            return res.redirect('/sensores');
        }
        
        res.render('sensores/editar', {
            title: 'Editar Sensor',
            sensor
        });
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/sensores');
    }
};

// Crear sensor - SSR
export const createSensor = async (req, res) => {
    try {
        const { nombre, tipo_sensor, estado_sensor, pais, ciudad, lat, lon } = req.body;
        
        const nuevoSensor = await SensorRepository.crear({
            nombre,
            configuracion: {
                tipo_sensor,
                estado_sensor: estado_sensor || 'activo',
                fechaInicioMedicion: new Date()
            },
            ubicacion: {
                pais,
                ciudad,
                lat: parseFloat(lat),
                lon: parseFloat(lon)
            }
        });
        
        req.session.success = 'Sensor creado exitosamente';
        res.redirect('/sensores/' + nuevoSensor._id);
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/sensores/nuevo');
    }
};

// Actualizar sensor - SSR
export const updateSensor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo_sensor, estado_sensor, pais, ciudad, lat, lon } = req.body;
        
        await SensorRepository.actualizar(id, {
            nombre,
            configuracion: {
                tipo_sensor,
                estado_sensor
            },
            ubicacion: {
                pais,
                ciudad,
                lat: parseFloat(lat),
                lon: parseFloat(lon)
            }
        });
        
        req.session.success = 'Sensor actualizado exitosamente';
        res.redirect('/sensores/' + id);
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/sensores/' + req.params.id + '/editar');
    }
};

// Eliminar sensor - SSR
export const deleteSensor = async (req, res) => {
    try {
        const { id } = req.params;
        await SensorRepository.eliminar(id);
        
        req.session.success = 'Sensor eliminado exitosamente';
        res.redirect('/sensores');
    } catch (error) {
        req.session.error = error.message;
        res.redirect('/sensores');
    }
};
