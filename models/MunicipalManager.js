import mongoose from 'mongoose';

const municipalManagerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: String,
  lastName: String,
  department: String,
  cityManaged: String,
}, { timestamps: true });

const MunicipalManager = mongoose.model('MunicipalManager', municipalManagerSchema);

export default MunicipalManager;
