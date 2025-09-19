import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    // enum: ['missed_collection', 'compliance_issue', 'complaint', 'technical_issue'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'], // valeurs autorisées
    required: false
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: false // pas obligatoire
  },
  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false // pas obligatoire
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
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
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;
