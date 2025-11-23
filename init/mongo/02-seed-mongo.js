// ============================================================
// SEED EXHAUSTIVO MONGODB - SIMULACIÓN IOT REALISTA
// ============================================================

db = db.getSiblingDB('clima_db');

print("🧹 Limpiando colecciones...");
db.sensores.deleteMany({});
db.mediciones.deleteMany({});
db.proceso.deleteMany({});
db.conversaciones.deleteMany({});

// ------------------------------------------------------------
// 1. CATÁLOGO DE 10 PROCESOS (Servicios Variados)
// ------------------------------------------------------------
const catalogoProcesos = [
    // Reportes
    { nombre: 'Informe Máx/Mín', descripcion: 'Estadísticas extremas', costo: 50.00, codigo: 'INFORME_MAXIMAS_MINIMAS' },
    { nombre: 'Informe Promedios', descripcion: 'Tendencia media', costo: 40.00, codigo: 'INFORME_PROMEDIOS' },
    { nombre: 'Análisis de Desviación', descripcion: 'Cálculo de varianza', costo: 60.00, codigo: 'ANALISIS_DESVIACION' },
    
    // Monitoreo
    { nombre: 'Detección de Alertas', descripcion: 'Búsqueda de valores fuera de rango', costo: 25.00, codigo: 'BUSCAR_ALERTAS' },
    { nombre: 'Consulta Raw Data', descripcion: 'Descarga de datos crudos', costo: 10.00, codigo: 'CONSULTAR_DATOS' },
    { nombre: 'Estado de Salud', descripcion: 'Verifica batería y conectividad', costo: 15.00, codigo: 'CHECK_SALUD' },

    // Acciones Remotas (Simuladas)
    { nombre: 'Reinicio Remoto', descripcion: 'Reinicia el microcontrolador', costo: 5.00, codigo: 'ACCION_REINICIO' },
    { nombre: 'Calibración de Sensores', descripcion: 'Ajuste de offset remoto', costo: 100.00, codigo: 'ACCION_CALIBRAR' },
    { nombre: 'Actualizar Firmware', descripcion: 'Update OTA', costo: 0.00, codigo: 'ACCION_UPDATE' },

    // Administrativos
    { nombre: 'Suscripción Mensual', descripcion: 'Acceso ilimitado por 30 días', costo: 500.00, codigo: 'SUSCRIPCION' }
];

db.proceso.insertMany(catalogoProcesos);
print("✅ 10 Procesos insertados.");

// ------------------------------------------------------------
// 2. GENERACIÓN DE 1000 SENSORES (Clusters Geográficos Realistas)
// ------------------------------------------------------------

// Definimos "Zonas Maestras"
const ZONAS = [
    { ciudad: "Buenos Aires", pais: "Argentina", lat: -34.6037, lon: -58.3816, prefijos: ["Estación", "Nodo", "Baliza"] },
    { ciudad: "Córdoba", pais: "Argentina", lat: -31.4201, lon: -64.1888, prefijos: ["Sierra", "Campo", "Antena"] },
    { ciudad: "Mendoza", pais: "Argentina", lat: -32.8895, lon: -68.8458, prefijos: ["Viñedo", "Bodega", "Cordillera"] },
    { ciudad: "Santiago", pais: "Chile", lat: -33.4489, lon: -70.6693, prefijos: ["Centro", "Valle", "Edificio"] },
    { ciudad: "Montevideo", pais: "Uruguay", lat: -34.9011, lon: -56.1645, prefijos: ["Puerto", "Rambla", "Plaza"] }
];
const TIPOS = ['Temperatura', 'Humedad', 'Temperatura/Humedad'];
const ESTADOS = ['activo', 'activo', 'activo', 'inactivo', 'falla']; 

const SUFIJOS = ["Norte", "Sur", "Este", "Oeste", "Central"]; // Simplificamos sufijos también

let sensoresGenerados = [];

// CAMBIO CLAVE: 25 Total / 5 Zonas = 5 Sensores por ciudad
const TOTAL_SENSORES = 25; 
const SENSORES_POR_ZONA = TOTAL_SENSORES / ZONAS.length;
ZONAS.forEach(zona => {
    for (let i = 0; i < SENSORES_POR_ZONA; i++) {
        // Generar variación geográfica
        const latVar = (Math.random() - 0.5) * 0.1;
        const lonVar = (Math.random() - 0.5) * 0.1;

        // Generar Nombre Realista
        const prefijo = zona.prefijos[Math.floor(Math.random() * zona.prefijos.length)];
        const sufijo = SUFIJOS[Math.floor(Math.random() * SUFIJOS.length)];
        const nombreReal = `${prefijo} ${zona.ciudad} ${sufijo} #${i + 1}`;

        sensoresGenerados.push({
            nombre: nombreReal,
            configuracion: {
                tipo_sensor: TIPOS[Math.floor(Math.random() * TIPOS.length)],
                estado_sensor: ESTADOS[Math.floor(Math.random() * ESTADOS.length)],
                fechaInicioMedicion: new Date("2024-01-01")
            },
            ubicacion: {
                pais: zona.pais,
                ciudad: zona.ciudad,
                lat: zona.lat + latVar,
                lon: zona.lon + lonVar
            }
        });
    }
});

const resultadoSensores = db.sensores.insertMany(sensoresGenerados);
const sensorIds = Object.values(resultadoSensores.insertedIds);
print(`✅ ${sensorIds.length} Sensores REALISTAS insertados.`);

// ------------------------------------------------------------
// 3. GENERACIÓN DE 2000+ MEDICIONES (Historial Reciente)
// ------------------------------------------------------------

const medicionesGeneradas = [];
const AHORA = new Date();

print("⏳ Generando mediciones aleatorias (esto puede tardar unos segundos)...");

sensorIds.forEach((id) => {
    // Generar entre 5 y 25 mediciones por sensor
    const cantidadMediciones = Math.floor(Math.random() * 20) + 5;

    for (let i = 0; i < cantidadMediciones; i++) {
        // Distribuidas en los últimos 30 días
        const diasAtras = Math.floor(Math.random() * 30);
        const horasAtras = Math.floor(Math.random() * 24);
        
        const fechaMedicion = new Date();
        fechaMedicion.setDate(AHORA.getDate() - diasAtras);
        fechaMedicion.setHours(AHORA.getHours() - horasAtras);

        medicionesGeneradas.push({
            sensor_id: id,
            timestamp: fechaMedicion,
            // Temperaturas variadas entre 15°C y 35°C
            temperatura: parseFloat((Math.random() * 20 + 15).toFixed(2)), 
            humedad: parseFloat((Math.random() * 50 + 30).toFixed(2))
        });
    }
});


medicionesGeneradas.push({
    sensor_id: sensorIds[0],
    timestamp: new Date(),
    temperatura: 45.5, // ¡ALERTA!
    humedad: 20.0
});

db.mediciones.insertMany(medicionesGeneradas);
print(`✅ ${medicionesGeneradas.length} Mediciones insertadas.`);