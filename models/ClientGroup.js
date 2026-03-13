const mongoose = require('mongoose');

const clientGroupSchema = new mongoose.Schema({
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
    
    clients: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    
    zone: { 
        type: String, 
        trim: true 
    },
    
    teamId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team',
        default: null
    },
    
    estimatedCollectionTime: { 
        type: Number, // en minutes
        default: 0 
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

// Index pour recherche rapide
clientGroupSchema.index({ agencyId: 1, status: 1 });
clientGroupSchema.index({ teamId: 1 });

module.exports = mongoose.model('ClientGroup', clientGroupSchema);
