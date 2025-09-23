import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  phone: { type: String },

  role: {
    type: String,
    enum: ['manager', 'collector'],
    required: true
  },
  // zones: [{
  //   type: String,
  // }],
  
  isActive: { type: Boolean, default: true },

  hiredAt: { type: Date, default: Date.now },

  avatar: { type: String },

}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
