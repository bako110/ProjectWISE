import mongoose from 'mongoose';

const municipalManagerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  agencyId: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Agency'
}],

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },

  // Commune/Département principal géré
  commune: {
    region: { type: String, required: true },
    province: { type: String, required: true },
    name: { type: String, required: true } // Ex: "Ouagadougou"
  },

  // Zones sous sa juridiction
  managedZones: [
    {
      arrondissement: { type: String },
      secteur: { type: String },
      quartier: { type: String },
      village: { type: String }
    }
  ],

  // Liste des agences rattachées à cette mairie

  position: { type: String, default: 'Maire' },

}, { timestamps: true });

const MunicipalManager = mongoose.model('MunicipalManager', municipalManagerSchema);

export default MunicipalManager;
