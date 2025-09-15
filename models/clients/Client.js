import mongoose from 'mongoose';
import crypto from 'crypto';
import QRCode from 'qrcode';

/* ---------------------------------------------------------------
 * Sous‑schéma : signalement de non‑passage
 * ------------------------------------------------------------- */
const reportSchema = new mongoose.Schema({
  type:        { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  date:        { type: Date,   required: true }
});

/* ---------------------------------------------------------------
 * Schéma principal : Client
 * Chaque client possède désormais :
 *   • qrToken : identifiant unique sécurisé
 *   • qrCodeImage : image PNG encodée en base64 générée automatiquement
 * ------------------------------------------------------------- */
const clientSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true,
    unique: true
  },

  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  phone:     { type: String, required: true, trim: true },

  // agencyId: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref:  'Agency'
  // }],

  address: {
    street:         { type: String, trim: true, required: true },
    doorNumber:     { type: String, trim: true, required: true },
    doorColor:      { type: String, trim: true },
    arrondissement: { type: String, trim: true },
    sector:         { type: String, trim: true },
    neighborhood:   { type: String, trim: true, required: true },
    city:           { type: String, trim: true, required: true },
    postalCode:     { type: String, trim: true },
    latitude:       { type: Number },
    longitude:      { type: Number }
  },

  subscribedAgencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Agency'
  },

  subscriptionHistory: [{
    date:   { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'pending', 'cancelled'], required: true },
    offer:  { type: String, trim: true }
  }],

  paymentHistory: [{
    amount: { type: Number, required: true },
    date:   { type: Date, default: Date.now },
    method: { type: String, trim: true },
    status: { type: String, enum: ['success', 'pending', 'failed'], required: true }
  }],

  nonPassageReports: [reportSchema],

  /* Consentements */
  acceptTerms:   { type: Boolean, required: true },
  receiveOffers: { type: Boolean, default: false },

  /* --------------------------- QR Code ------------------------ */
  qrToken: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(12).toString('hex'),  // Génère un token unique hexadécimal
  },

  qrCodeImage: {  // PNG encodé base64 (data URI)
    type: String
  }

}, { timestamps: true });

/* ---------------------------------------------------------------
 * Hook : avant sauvegarde, générer l’image QR si manquante
 * ------------------------------------------------------------- */
clientSchema.pre('save', async function (next) {
  try {
    if (!this.qrCodeImage && this.qrToken) {
      // Génère une image QR code à partir du qrToken
      this.qrCodeImage = await QRCode.toDataURL(this.qrToken);
    }
    next();
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------- */
const Client = mongoose.model('Client', clientSchema);
export default Client;
