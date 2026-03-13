const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    
    agencyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Agence', 
        required: true 
    },
    
    leaderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    collectors: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    
    zones: [{ 
        type: String, 
        trim: true 
    }],
    
    maxClientsPerDay: { 
        type: Number, 
        default: 50 
    },
    
    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    },
    
    description: { 
        type: String, 
        trim: true 
    }
}, { 
    timestamps: true 
});

// Index pour recherche rapide par agence
teamSchema.index({ agencyId: 1, status: 1 });

module.exports = mongoose.model('Team', teamSchema);
