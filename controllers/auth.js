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

    // Réponse unifiée avec données spécifiques selon le rôle
    const responseData = {
      userId: result.user._id,
      roleId: result.roleData._id,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      phone: result.user.phone,
      role: result.role,
      status: result.user.status,
      acceptTerms: result.user.acceptTerms,
      receiveOffers: result.user.receiveOffers,
      address: result.user.address
    };

    // Ajouter les données spécifiques selon le rôle
    switch (result.role) {
      case 'client':
        responseData.qrCode = result.roleData.qrCode;
        responseData.qrCodeImage = result.roleData.qrCodeImage;
        break;

      case 'agence':
        responseData.agencyName = result.roleData.agencyName;
        responseData.agencyDescription = result.roleData.agencyDescription;
        responseData.agencyId = result.roleData._id;
        break;

      case 'collector':
        responseData.agencyId = result.roleData.agencyId;
        responseData.planning = result.roleData.planning;
        responseData.collection = result.roleData.collection;
        break;

      case 'manager':
        responseData.agencyId = result.roleData.agencyId;
        responseData.nbManager = result.roleData.nbManager;
        responseData.activity = result.roleData.activity;
        break;

      case 'municipality':
        responseData.municipalityCode = result.roleData.municipalityCode;
        responseData.region = result.roleData.region;
        break;

      case 'super_admin':
        responseData.adminLevel = result.roleData.adminLevel;
        responseData.permissions = result.roleData.permissions;
        break;
    }

    res.status(201).json({
      success: true,
      message: `Inscription ${result.role} réussie`,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Erreur inscription:', error.message);
    
    // Gestion des erreurs selon leur type
    let statusCode = 500;
    let message = error.message;

    if (error.message.includes('manquants') || 
        error.message.includes('requis') ||
        error.message.includes('invalide') ||
        error.message.includes('déterminer') ||
        error.message.includes('conditions d\'utilisation')) {
      statusCode = 400; // Bad Request
    } else if (error.message.includes('déjà utilisé') || 
               error.message.includes('existe pas')) {
      statusCode = 409; // Conflict
    } else if (error.message.includes('non supporté')) {
      statusCode = 422; // Unprocessable Entity
    }

    res.status(statusCode).json({
      success: false,
      message: message,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};