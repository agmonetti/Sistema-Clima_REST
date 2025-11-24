db = db.getSiblingDB('clima_db');

print("🧹 Limpiando colecciones...");
db.sensores.deleteMany({});
db.mediciones.deleteMany({});
db.proceso.deleteMany({});
db.conversaciones.deleteMany({});

// ------------------------------------------------------------
// 1. CATÁLOGO DE 6 PROCESOS (Servicios Variados)
// ------------------------------------------------------------
const catalogoProcesos = [
    { nombre: 'Informe Máx/Mín', descripcion: 'Estadísticas extremas', costo: 50.00, codigo: 'INFORME_MAXIMAS_MINIMAS' },
    { nombre: 'Informe Promedios', descripcion: 'Tendencia media', costo: 40.00, codigo: 'INFORME_PROMEDIOS' },
    { nombre: 'Análisis de Desviación', descripcion: 'Cálculo de varianza', costo: 60.00, codigo: 'ANALISIS_DESVIACION' },
    { nombre: 'Detección de Alertas', descripcion: 'Búsqueda de valores fuera de rango', costo: 25.00, codigo: 'BUSCAR_ALERTAS' },
    { nombre: 'Consulta Raw Data', descripcion: 'Descarga de datos crudos', costo: 10.00, codigo: 'CONSULTAR_DATOS' },
    { nombre: 'Estado de Salud', descripcion: 'Verifica batería y conectividad', costo: 15.00, codigo: 'CHECK_SALUD' },

];

db.proceso.insertMany(catalogoProcesos);
print("✅ 10 Procesos insertados.");

// ------------------------------------------------------------
// 2. 25 sensores, 5 por zona
// ------------------------------------------------------------

const ZONAS = [
    { ciudad: "Buenos Aires", pais: "Argentina", lat: -34.6037, lon: -58.3816, prefijos: ["Estación", "Nodo", "Baliza"] },
    { ciudad: "Córdoba", pais: "Argentina", lat: -31.4201, lon: -64.1888, prefijos: ["Sierra", "Campo", "Antena"] },
    { ciudad: "Mendoza", pais: "Argentina", lat: -32.8895, lon: -68.8458, prefijos: ["Viñedo", "Bodega", "Cordillera"] },
    { ciudad: "Santiago", pais: "Chile", lat: -33.4489, lon: -70.6693, prefijos: ["Centro", "Valle", "Edificio"] },
    { ciudad: "Montevideo", pais: "Uruguay", lat: -34.9011, lon: -56.1645, prefijos: ["Puerto", "Rambla", "Plaza"] }
];
const TIPOS = ['Temperatura', 'Humedad', 'Temperatura/Humedad'];
const ESTADOS = ['activo', 'activo', 'activo', 'inactivo', 'falla']; 

const SUFIJOS = ["Norte", "Sur", "Este", "Oeste", "Central"];

let sensoresGenerados = [];

const TOTAL_SENSORES = 25; 
const SENSORES_POR_ZONA = TOTAL_SENSORES / ZONAS.length;
ZONAS.forEach(zona => {
    for (let i = 0; i < SENSORES_POR_ZONA; i++) {
        // Generar variación geográfica
        const latVar = (Math.random() - 0.5) * 0.1;
        const lonVar = (Math.random() - 0.5) * 0.1;

        const latFinal = parseFloat((zona.lat + latVar).toFixed(4));
        const lonFinal = parseFloat((zona.lon + lonVar).toFixed(4));

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
                lat: latFinal,
                lon: lonFinal
            }
        });
    }
});

const resultadoSensores = db.sensores.insertMany(sensoresGenerados);
const sensorIds = Object.values(resultadoSensores.insertedIds);
// ------------------------------------------------------------
// 3. GENERACIÓN DE 5-25 MEDICIONES 
// ------------------------------------------------------------

const medicionesGeneradas = [];
const AHORA = new Date();
const FECHA_INICIO = new Date('2023-01-01').getTime();
const FECHA_FIN = AHORA.getTime();

print("⏳ Generando mediciones (4 por sensor)...");

sensorIds.forEach((id) => {
    // Regla: 4 Mediciones fijas
    for (let i = 0; i < 4; i++) {
        
        // Fecha aleatoria entre 2023 y Hoy
        const tiempoAleatorio = new Date(FECHA_INICIO + Math.random() * (FECHA_FIN - FECHA_INICIO));

        medicionesGeneradas.push({
            sensor_id: id,
            timestamp: tiempoAleatorio,
            temperatura: parseFloat((Math.random() * 25 + 10).toFixed(2)), // 10 a 35
            humedad: parseFloat((Math.random() * 60 + 30).toFixed(2))      // 30 a 90
        });
    }
});

// Inyectamos UN caso de alerta en el primer sensor
medicionesGeneradas.push({
    sensor_id: sensorIds[0],
    timestamp: new Date(), // HOY
    temperatura: 48.5,
    humedad: 15.0
});

db.mediciones.insertMany(medicionesGeneradas);