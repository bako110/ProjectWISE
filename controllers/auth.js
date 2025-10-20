
// ========================================
// controllers/authController.js
// ========================================
const registrationService = require('../services/auth');

/**
 * 🎯 CONTRÔLEUR UNIQUE - Gère toutes les inscriptions
 */
exports.register = async (req, res) => {
  try {
    // Le service se charge de tout le tri et la validation
    const result = await registrationService.register(req.body);

    // Réponse unifiée
    res.status(201).json({
      success: true,
      message: `Inscription ${result.role} réussie`,
      data: {
        userId: result.user._id,
        roleId: result.roleData._id,
        firstname: result.user.firstname,
        lastname: result.user.lastname,
        email: result.user.email,
        phone: result.user.phone,
        role: result.role,
        // Données supplémentaires selon le rôle
        ...(result.role === 'agency' && { 
          agencyName: result.roleData.name 
        }),
        ...(result.role === 'collector' && { 
          agencyId: result.roleData.agencyId 
        }),
        ...(result.role === 'manager' && { 
          agencyId: result.roleData.agencyId 
        })
      }
    });

  } catch (error) {
    console.error('❌ Erreur inscription:', error.message);
    
    // Gestion des erreurs selon leur type
    const statusCode = error.message.includes('manquants') || 
                       error.message.includes('requis') ? 400 : 
                       error.message.includes('déjà utilisé') ? 409 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
