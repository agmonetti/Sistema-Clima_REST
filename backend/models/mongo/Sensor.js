import mongoose , {Schema} from "mongoose";

const sensorSchema = new Schema({
    nombre: { type: String, required: true },
    
    configuracion: { 
        tipo_sensor: { type: String, required: true , enum: ['temperatura', 'humedad', 'temperatura/humedad'] },
        estado_sensor: { type: String, enum: ['activo', 'inactivo', 'falla'], default: 'activo' },
        fechaInicioMedicion: { type: Date, default: Date.now },
    },
    
    ubicacion: { 
        pais: { type: String, required: true },
        ciudad: { type: String, required: true },
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
    }
    
});

export default mongoose.model('Sensor', sensorSchema);