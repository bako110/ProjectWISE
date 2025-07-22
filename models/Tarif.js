import mongoose from 'mongoose';


const tarifSchema = new mongoose.Schema({
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true
    },
    clientId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    }],
    type: {
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
    nbPassages: {
        type: Number,
        default: 0
    },
});

export default mongoose.model('Tarif', tarifSchema);