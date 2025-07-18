import mongoose from 'mongoose';

const collectionReportSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },

  reportType: {
    type: String,
    enum: ['missed_collection', 'incomplete_collection', 'damage', 'complaint', 'other'],
    required: true
  },

  description: {
    type: String,
    required: true
  },

  photos: [String],

  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },

  resolution: { type: String },

  resolvedAt: Date

}, { timestamps: true });

const CollectionReport = mongoose.model('CollectionReport', collectionReportSchema);
export default CollectionReport;
