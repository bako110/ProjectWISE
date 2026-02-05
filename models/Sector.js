const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true , unique: true },
    // description: { type: String, trim: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City'},
    arrondissementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arrondissement'},
    latitude: { type: Number, trim: true },
    longitude: { type: Number, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Sector', sectorSchema);