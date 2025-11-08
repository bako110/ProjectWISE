const mongoose = require('mongoose');

const planningSchema = new mongoose.Schema({
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
        ref: 'Agency',
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
    }
}, { timestamps: true });

module.exports = mongoose.model('Planning', planningSchema);