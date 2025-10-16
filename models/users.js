// models/users.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true, trim: true },
  lastname:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  role: {
    type: String,
    enum: ['client', 'collector', 'agency', 'manager', 'municipality', 'super_admin'],
    default: 'client',
  },
  phone: { type: String, trim: true },
  address:   { type: String, trim: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active',
  },
  createdate: { type: Date, default: Date.now },
  updatedate: { type: Date, default: Date.now },
  deletedate: { type: Date },
}, {
  timestamps: true, // createdAt et updatedAt automatiques
});

// Hachage du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Vérifier le mot de passe
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
