import mongoose from 'mongoose';

const collectorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    unique: true
  },

  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },

  // Affectations géographiques du collecteur
  assignedAreas: [
    {
      region: { type: String, required: true },
      province: { type: String, required: true },
      commune: { type: String, required: true },
      arrondissement: { type: String },
      secteur: { type: String },
      quartier: { type: String }
    }
  ],

  vehicleInfo: {
    type: { type: String },          // Exemple: "Moto", "Tricycle", "Camion"
    plateNumber: { type: String }
  }

}, { timestamps: true });

const Collector = mongoose.model('Collector', collectorSchema);

export default Collector;
