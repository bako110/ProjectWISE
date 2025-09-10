import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
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
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;
