import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
  },

  name: { type: String, required: true }, // Exemple : "Zone Centre", "Tampouy"

  location: {
    region: String,
    province: String,
    commune: String,
    arrondissement: String,
    secteur: String,
    quartier: String,
  },

  polygonGeoJson: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon',
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON format
      required: true,
    },
  },

  assignedCollectors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collector',
    },
  ],
}, { timestamps: true });

const Zone = mongoose.model('Zone', zoneSchema);
export default Zone;
