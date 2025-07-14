import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  contactPerson: String,
  phone: String,
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: String,
  },
  licenseNumber: { type: String, unique: true },
  description: String,
  coveredAreas: [
    {
      city: String,
      sectors: [String],
    }
  ],
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const Agency = mongoose.model('Agency', agencySchema);

export default Agency;
