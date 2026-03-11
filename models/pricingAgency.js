const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true
    },
    planType: { // anciennement "type"
        type: String,
        enum: ['standard', 'premium', 'enterprise'],
        required: true,
        default: 'standard'
    },
    price: {
        type: Number,
        required: true,
        default: 500
    },
    description: {
        type: String,
    },
    numberOfPasses: { // anciennement "nbPassages"
        type: Number,
        default: 0
    },
}, { timestamps: true });

module.exports = mongoose.model('Pricing', pricingSchema); // anciennement "Tarif"
