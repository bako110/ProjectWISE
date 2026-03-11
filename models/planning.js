const mongoose = require('mongoose');

const planningSchema = new mongoose.Schema({
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
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
        // required: true
    },
    collectors: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
    },
    // collectedby: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    // },
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
        type: Boolean,
        default: true
    },
    pricingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pricing',
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrenceType: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly'],
        default: 'weekly'
    },
    numberOfWeeks: {
        type: Number,
        default: 1
    },
    weeksRemaining: {
        type: Number,
        default: 0
    },
    parentPlanningId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Planning',
        default: null
    },
    nextDuplicationDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Planning', planningSchema);