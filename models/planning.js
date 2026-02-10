const mongoose = require('mongoose');

const planningSchema = new mongoose.Schema({
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    zone: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    collectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agence',
        required: true
    },
    code : {
        type: String,
    },
    numberOfClients: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean, default: true 
    },
    // status: {
    //     type: String,
    //     enum: ['Scheduled', 'Completed', 'Cancelled', 'Asked'],
    //     default: 'Scheduled'
    // },
    // pricingId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Pricing',
    // }
}, { timestamps: true });

module.exports = mongoose.model('Planning', planningSchema);