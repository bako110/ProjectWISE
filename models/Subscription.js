import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  agencyId: {type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true},
  plan: { type: String, enum: ['basic', 'premium', 'enterprise'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive', 'canceled'], default: 'active' },
  // paymentDetails: {
  //   method: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer'], required: true },
    //   transactionId: { type: String, required: true },
    //   amount: { type: Number, required: true },
    //   currency: { type: String, required: true },
    //   paymentDate: { type: Date, default: Date.now }
    // },
//   isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;