import mongoose from 'mongoose';

const collectionRouteSchema = new mongoose.Schema({
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],

  optimizedOrder: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],

  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },

  startTime: Date,
  endTime: Date,
  totalDistance: Number,
  estimatedDuration: Number

}, { timestamps: true });

const CollectionRoute = mongoose.model('CollectionRoute', collectionRouteSchema);
export default CollectionRoute;
