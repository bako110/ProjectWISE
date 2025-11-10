const mongoose = require('mongoose');

const passageSchema = new mongoose.Schema({
    clientId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agencyId : { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    weekNumber: { type: Number, required: true, default: 1 },
    dayNumber : { type: Number, required: true },
    passNumber : { type: Number, default: 0 },
    status: { type: Boolean, default: true },
}, { timestamps: true
});

const Passage = mongoose.model('Passage', passageSchema);
module.exports = Passage;

