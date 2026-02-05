const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true,unique: true  },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    latitude: { type: Number, trim: true },
    longitude: { type: Number, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Arrondissement', citySchema);