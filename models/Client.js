import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: String,
  lastName: String,
  phone: String,
  serviceAddress: {
    street: String,
    city: String,
    zipCode: String,
    district: String,
    doorNumber: String,
    doorColor: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
  },
  subscribedAgencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'pending', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

clientSchema.index({ 'serviceAddress.coordinates': '2dsphere' });

const Client = mongoose.model('Client', clientSchema);

export default Client;
