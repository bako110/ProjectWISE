const mongoose = require('mongoose');

const collecteSchema = new mongoose.Schema({
    agencyId : { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    collectorId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Collected', 'Scheduled', 'Completed', 'Cancelled','Reported' ], default: 'Scheduled' },
    code : { type: String},
    photos : { type: [String] },
    comment : { type: String },
    nbCollecte : { type: Number },
}, { timestamps: true
});

const Collecte = mongoose.model('Collecte', collecteSchema);
module.exports = Collecte;