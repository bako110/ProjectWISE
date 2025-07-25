import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  // autres infos spécifiques admin si besoin
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
