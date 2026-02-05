const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  role: {
    type: String,
    enum: ['client', 'collector', 'manager', 'municipality', 'super_admin'],
  },
  phone: { type: String, required: true, trim: true, unique: true },
  address: {
    street: { type: String, trim: true },
    arrondissement: { type: String, trim: true },
    sector: { type: String, trim: true },
    doorNumber: { type: String, trim: true },
    doorColor: { type: String, trim: true },
    neighborhood: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active',
  },
  acceptTerms: {
    type: Boolean,
    default: false,
  },
  receiveOffers: {
    type: Boolean,
    default: false,
  },
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agence',
    default: null,
  },
  qrToken: {
    type: String,
    default: null,
  },
  qrCode: {
    type: String,
    default: null,
  },

  nbGestionnaires: {
    type: Number,
    default: null,
  },
  isOwnerAgency: {
    type: Boolean,
    default: null,
  },
  resetPasswordCode: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  deletedate: { type: Date },

  // 🔹 Nouveau champ : subscriptionId pour lier l'utilisateur à son abonnement
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  }

}, {
  timestamps: true,
});

userSchema.index({ 'address.location': '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
