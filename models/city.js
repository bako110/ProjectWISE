const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    isArrondissement: { type: Boolean, default: false },
    // state: { type: String, required: true, trim: true },
    // country: { type: String, required: true, trim: true },
    latitude: { type: Number, trim: true },
    longitude: { type: Number, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('City', citySchema);