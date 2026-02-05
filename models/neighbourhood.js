const mongoose = require('mongoose');

const neighborhoodSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true , unique: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City'},
    arrondissementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arrondissement'},
    sectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sector'},
    latitude: { type: Number, trim: true },
    longitude: { type: Number, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Neighborhood', neighborhoodSchema);