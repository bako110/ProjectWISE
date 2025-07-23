import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    response: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        enum: ['pending','completed', 'failed'],
        default: 'pending'
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    tarifId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tarif',
        required: true
    },
});

export default mongoose.model('Payment', paymentSchema);