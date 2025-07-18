import mongoose from 'mongoose';

const municipalManagerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  agencyId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
  }],

  // Nom complet du responsable mairie
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  // Nom officiel de la mairie (ex: "Mairie de Ouagadougou")
  name: { type: String, required: true },

  phone: { type: String },

  // Commune/Département principal géré
  commune: {
    region: { type: String },
    province: { type: String },
    name: { type: String }, // ex: "Ouagadougou"
  },

  // Zones sous sa juridiction
  managedZones: [
    {
      arrondissement: { type: String },
      secteur: { type: String },
      quartier: { type: String },
      village: { type: String },
    }
  ],

  position: { type: String, default: 'Maire' },

}, { timestamps: true });

const MunicipalManager = mongoose.model('MunicipalManager', municipalManagerSchema);

export default MunicipalManager;
