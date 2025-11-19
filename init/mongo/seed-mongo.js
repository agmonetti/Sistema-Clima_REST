
// Archivo: ./init/mongo/seed-mongo.js

// 1. Usar/Crear la base de datos de trabajo
// CRÍTICO: Esto asegura que el script sepa dónde insertar.
db = db.getSiblingDB('clima_db');

print("--- STARTING MONGODB SEEDING ---");

// ===============================================
// 2. INSERCIÓN DE SENSORES MAESTROS (5 Documentos)
// ===============================================

// Array para almacenar los _id de los sensores insertados
let sensorIds = [];

const sensores_data = [
    {
        nombre: "Estación Central CABA",
        tipo_sensor: "Temperatura",
        configuracion: { estado_sensor: "activo", fechaInicioMedicion: new Date("2025-01-01") },
        ubicacion: { pais: "Argentina", ciudad: "Buenos Aires", lat: -34.6037, lon: -58.3816 }
    },
    {
        nombre: "Estación Córdoba",
        tipo_sensor: "Humedad",
        configuracion: { estado_sensor: "activo", fechaInicioMedicion: new Date("2025-01-15") },
        ubicacion: { pais: "Argentina", ciudad: "Córdoba", lat: -31.4201, lon: -64.1888 }
    },
    {
        nombre: "Estación Patagonia Sur",
        tipo_sensor: "Temperatura/Humedad",
        configuracion: { estado_sensor: "falla", fechaInicioMedicion: new Date("2025-02-01") },
        ubicacion: { pais: "Argentina", ciudad: "Río Gallegos", lat: -51.6225, lon: -69.2181 }
    },
    {
        nombre: "Estación Norte Salta",
        tipo_sensor: "Temperatura",
        configuracion: { estado_sensor: "inactivo", fechaInicioMedicion: new Date("2025-03-01") },
        ubicacion: { pais: "Argentina", ciudad: "Salta", lat: -24.7824, lon: -65.4117 }
    },
    {
        nombre: "Estación San Pablo",
        tipo_sensor: "Humedad",
        configuracion: { estado_sensor: "activo", fechaInicioMedicion: new Date("2025-04-01") },
        ubicacion: { pais: "Brasil", ciudad: "São Paulo", lat: -23.5505, lon: -46.6333 }
    }
];

db.sensores.insertMany(sensores_data, { ordered: false });

// Recuperar los IDs para la referencia en la tabla Mediciones
db.sensores.find({}).forEach(function(doc) {
    sensorIds.push(doc._id);
});

print(`[INFO] Insertados ${sensorIds.length} Sensores Maestros.`);


// ===============================================
// 3. INSERCIÓN DE MEDICIONES MASIVAS (1000 Documentos)
// ===============================================

const mediciones = [];
const numMediciones = 1000;
const now = new Date();

for (let i = 0; i < numMediciones; i++) {
    const sensorIndex = i % sensorIds.length;
    const timeOffsetMinutes = i * 2; // Simula una medición cada 2 minutos
    
    mediciones.push({
        // Referencia al ObjectId del sensor
        sensor_id: sensorIds[sensorIndex], 
        // Genera timestamps decrecientes (datos recientes)
        timestamp: new Date(now.getTime() - timeOffsetMinutes * 60000), 
        temperatura: parseFloat((Math.random() * 30 + 10).toFixed(2)), // 10.00 to 40.00
        humedad: parseFloat((Math.random() * 50 + 40).toFixed(2))     // 40.00 to 90.00
    });
}

db.mediciones.insertMany(mediciones, { ordered: false });
print(`[INFO] Insertadas ${numMediciones} Mediciones Masivas.`);

// ===============================================
// 4. INSERCIÓN DE CATÁLOGOS Y CHAT
// ===============================================

// Limpieza previa
db.proceso.deleteMany({});

const procesos_tpo = [
    { 
        nombre: 'Informe Máx/Mín (Anual/Mensual)', 
        descripcion: 'Informe de humedad y temperaturas máximas y mínimas por ciudades/zonas en rango de fechas.', 
        costo: 50.00, 
        codigo: 'INFORME_MAXIMAS_MINIMAS'
    },
    { 
        nombre: 'Informe Promedios (Anual/Mensual)', 
        descripcion: 'Informe de humedad y temperaturas promedio por ciudades/zonas en rango de fechas.', 
        costo: 40.00, 
        codigo: 'INFORME_PROMEDIOS' 
    },
    { 
        nombre: 'Detección de Alertas', 
        descripcion: 'Búsqueda de alertas de temperaturas y humedad fuera de rango en una zona y fechas.', 
        costo: 25.00, 
        codigo: 'BUSCAR_ALERTAS'
    },
    { 
        nombre: 'Consulta en Línea (Datos Crudos)', 
        descripcion: 'Servicio de consulta directa de información de sensores por ciudad/zona.', 
        costo: 10.00, 
        codigo: 'CONSULTAR_DATOS' 
    },
    { 
        nombre: 'Suscripción Periódica Mensual', 
        descripcion: 'Proceso automático de consultas sobre humedad y temperaturas mensualizadas.', 
        costo: 100.00, 
        codigo: 'SUSCRIPCION'
    }
];

db.proceso.insertMany(procesos_tpo);