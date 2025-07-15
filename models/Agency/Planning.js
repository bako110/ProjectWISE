import mongoose from 'mongoose';

const planningSchema = new mongoose.Schema({
  date: { type: Date, required: true },               // Date de la tournée
  heure: { type: String, required: true },            // Heure au format "HH:mm"
  zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true },      // Zone concernée
  collecteur: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector', required: true }, // Collecteur assigné
  statut: { 
    type: String, 
    enum: ['prévu', 'effectué', 'problème'], 
    default: 'prévu' 
  },
  commentaire: { type: String },
  photos: [{ type: String }],  // URLs ou chemins des photos
  positionGPS: {
    lat: Number,
    lng: Number
  },
  dateEffectuee: Date
}, { timestamps: true });

const Planning = mongoose.model('Planning', planningSchema);

export default Planning;
