import mongoose from 'mongoose';

/* Position GPS (lat, lng) */
const positionGPSSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: function () {
      return this != null;
    },
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: function () {
      return this != null;
    },
    min: -180,
    max: 180
  }
}, { _id: false });

/* Scan d’une collecte */
const scanReportSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false  // Peut être null si scan public
  },

  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: false  // Peut être null si scan public
  },

  scannedAt: {
    type: Date,
    default: Date.now
  },

status: {
  type: String,
  enum: ['collected'],
  required: false
},
  
  photos: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.every(p => typeof p === 'string');
      },
      message: 'Chaque photo doit être une chaîne valide.'
    },
    default: []
  },

  positionGPS: {
    type: positionGPSSchema,
    default: null
  }

}, { timestamps: true });

export default mongoose.model('ScanReport', scanReportSchema);
