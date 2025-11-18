import mongoose, { Schema } from "mongoose";

const medicionSchema = new Schema({
    temperatura: { type: Number, required: true },
    humedad: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    
    sensor_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Sensor',              
        required: true
    }
});

export default mongoose.model('Medicion', medicionSchema);
