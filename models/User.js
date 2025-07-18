import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'L’email est requis'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
    },
    role: {
      type: String,
      enum: [
        'client',          // Utilisateur particulier ou entreprise
        'collector',       // Agent de collecte
        'agency',
        'manager',          // Agence de collecte
        'municipality',    // Municipalité (mairie)
        'super_admin'      // Super administrateur global
      ],
      required: [true, 'Le rôle est requis'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);
