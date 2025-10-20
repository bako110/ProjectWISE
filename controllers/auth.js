// ========================================
// controllers/authController.js
// ========================================
const registrationService = require('../services/authService');

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
      firstname: result.user.firstname,
      lastname: result.user.lastname,
      email: result.user.email,
      phone: result.user.phone,
      role: result.role,
      status: result.user.status
    };

    // Ajouter les données spécifiques selon le rôle
    switch (result.role) {
      case 'client':
        responseData.qrCode = result.roleData.qrCode;
        responseData.qrCodeImage = result.roleData.qrCodeImage;
        break;

      case 'agency':
        responseData.agencyName = result.roleData.name;
        responseData.agencyId = result.roleData._id;
        responseData.zoneActivite = result.roleData.zoneActivite;
        responseData.clientId = result.roleData.client;
        responseData.collectorId = result.roleData.collector;
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
        error.message.includes('déterminer')) {
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