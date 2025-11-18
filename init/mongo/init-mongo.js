db = db.getSiblingDB('clima_db');


db.createCollection("mediciones");
db.createCollection("sensores");
db.createCollection("conversaciones");
db.createCollection("proceso");


db.mediciones.createIndex(
    { sensor_id: 1, timestamp: -1 }, 
    { name: "idx_sensor_timestamp" }
);

db.sensores.createIndex(
    { "ubicacion.lon": 1, "ubicacion.lat": 1 },
    { name: "idx_ubicacion" }
);

db.conversaciones.createIndex(
    { participantes: 1 }, 
    { name: "idx_participantes" }
);