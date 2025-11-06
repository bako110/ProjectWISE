import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // ou Client si tu as un modèle Client
      required: true
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: true
    },
    subscriptionDetails: {
      planType: {
        type: String,
        enum: ['standard', 'premium', 'enterprise'],
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        default: ''
      },
      numberOfPasses: {
        type: Number,
        default: 1
      },
      startDate: {
        type: Date,
        default: Date.now
      },
      endDate: {
        type: Date
      },
      startTime: {
        type: String, // format "HH:MM" ou "HH:MM:SS"
        default: '00:00'
      },
      endTime: {
        type: String, // format "HH:MM" ou "HH:MM:SS"
        default: '23:59'
      }
    },
    qrCode: {
      type: String, // lien ou base64 du QR code
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended'],
      default: 'active'
    }
  },
  { timestamps: true } // createdAt et updatedAt automatiques
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
