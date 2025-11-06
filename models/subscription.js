const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',    
        required: true
    },
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true
    },
    pricingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pricing',
        required: true
    },  
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },  
    
    endDate: {
        type: Date,
        required: true          
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);