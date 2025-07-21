import mongoose from 'mongoose';

const positionGPSSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: function() { return this.positionGPS != null; },
  },
  lng: {
    type: Number,
    required: function() { return this.positionGPS != null; },
  },
}, { _id: false });

const scanReportSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['collected', 'problem'],
    default: 'collected',
  },
  comment: {
    type: String,
    // obligatoire si status === 'problem'
    required: function() {
      return this.status === 'problem';
    },
  },
  photos: {
    type: [String], // tableau d'urls / chemins de photos
    default: [],
  },
  positionGPS: {
    type: positionGPSSchema,
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('ScanReport', scanReportSchema);
