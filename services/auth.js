// ========================================
// services/registrationService.js
// ========================================
const User = require('../models/users');
const Client = require('../models/client');
const Agency = require('../models/agency');
const Collector = require('../models/collector');
const Manager = require('../models/manager');
const MunicipalityManager = require('../models/municipalityManager');
const Admin = require('../models/admin');

class RegistrationService {
  
  /**
   * 🎯 POINT D'ENTRÉE UNIQUE - Tri automatique des données
   */
  async register(rawData) {
    try {
      // 1️⃣ Détecter et valider le rôle
      const role = this.detectRole(rawData);
      
      // 2️⃣ Extraire et valider les données selon le rôle
      const validatedData = this.validateAndExtractData(rawData, role);
      
      // 3️⃣ Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser) {
        throw new Error('Cet email est déjà utilisé');
      }

      // 4️⃣ Créer l'utilisateur et les données de rôle
      const result = await this.createUserWithRole(validatedData, role);

      return result;

    } catch (error) {
      throw error;
    }
  }

  /**
   * 🔍 Détecte le rôle à partir des données
   */
  detectRole(data) {
    // Priorité 1: Rôle explicite
    if (data.role) {
      return data.role.toLowerCase();
    }

    // Priorité 2: Détection par champs spécifiques
    if (data.agencyName || data.name || data.zoneActivite) {
      return 'agency';
    }
    
    if (data.agencyId && (data.planning || data.collection)) {
      return 'collector';
    }
    
    if (data.agencyId && (data.nbManager || data.activity)) {
      return 'manager';
    }
    
    if (data.isSuperAdmin || data.adminLevel) {
      return 'super_admin';
    }
    
    if (data.isMunicipality || data.municipalityCode) {
      return 'municipality';
    }
  }

  /**
   * ✅ Valide et extrait les données selon le rôle
   */
  validateAndExtractData(data, role) {
    // Champs communs obligatoires
    const commonFields = ['firstname', 'lastname', 'email', 'password', 'phone'];
    const missing = commonFields.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Champs obligatoires manquants: ${missing.join(', ')}`);
    }

    // Structure de base
    const validated = {
      // Données utilisateur
      firstname: data.firstname.trim(),
      lastname: data.lastname.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
      phone: data.phone.trim(),
      address: data.address || {},
      role: role,
      
      // Données spécifiques au rôle
      roleSpecificData: {}
    };

    // Extraction des données spécifiques selon le rôle
    switch (role) {
      case 'client':
        // Pas de données supplémentaires
        break;

      case 'agency':
        if (!data.clientId || !data.collectorId) {
          throw new Error('Une agence nécessite clientId et collectorId');
        }
        validated.roleSpecificData = {
          name: data.name || data.agencyName || '',
          agencyName: data.agencyName || data.name || '',
          agencyDescription: data.agencyDescription || '',
          zoneActivite: data.zoneActivite || '',
          slogan: data.slogan || '',
          clientId: data.clientId,
          collectorId: data.collectorId
        };
        break;

      case 'collector':
        if (!data.agencyId) {
          throw new Error('Un collecteur doit être associé à une agence (agencyId requis)');
        }
        validated.roleSpecificData = {
          agencyId: data.agencyId,
          planning: data.planning || '',
          collection: data.collection || ''
        };
        break;

      case 'manager':
        if (!data.agencyId) {
          throw new Error('Un manager doit être associé à une agence (agencyId requis)');
        }
        validated.roleSpecificData = {
          agencyId: data.agencyId,
          nbManager: data.nbManager || 1,
          activity: data.activity || ''
        };
        break;

      case 'municipality':
        validated.roleSpecificData = {
          municipalityCode: data.municipalityCode || '',
          region: data.region || ''
        };
        break;

      case 'super_admin':
        validated.roleSpecificData = {
          adminLevel: data.adminLevel || 'super',
          permissions: data.permissions || []
        };
        break;

      default:
        // Client par défaut
        break;
    }

    return validated;
  }

  /**
   * 🏗️ Crée l'utilisateur et les données de rôle
   */
  async createUserWithRole(validatedData, role) {
    // 1️⃣ Créer l'utilisateur de base
    const userData = {
      firstname: validatedData.firstname,
      lastname: validatedData.lastname,
      email: validatedData.email,
      password: validatedData.password,
      phone: validatedData.phone,
      address: validatedData.address,
      role: role,
      status: 'active'
    };

    // Ajouter les champs spéciaux pour agency
    if (role === 'agency' && validatedData.roleSpecificData.agencyName) {
      userData.agencyName = validatedData.roleSpecificData.agencyName;
    }

    const newUser = await User.create(userData);

    // 2️⃣ Créer les données de rôle selon le type
    let roleData;

    switch (role) {
      case 'client':
        roleData = await Client.create({
          userId: newUser._id,
          qrCode: '',
          status: 'active'
        });
        break;

      case 'agency':
        roleData = await Agency.create({
          userId: newUser._id,
          name: validatedData.roleSpecificData.name,
          agencyDescription: validatedData.roleSpecificData.agencyDescription,
          zoneActivite: validatedData.roleSpecificData.zoneActivite,
          slogan: validatedData.roleSpecificData.slogan,
          client: validatedData.roleSpecificData.clientId,
          collector: validatedData.roleSpecificData.collectorId,
          gestionnaires: [],
          documents: [],
          status: 'active'
        });
        break;

      case 'collector':
        roleData = await Collector.create({
          userId: newUser._id,
          agencyId: validatedData.roleSpecificData.agencyId,
          planning: validatedData.roleSpecificData.planning,
          collection: validatedData.roleSpecificData.collection,
          status: 'active'
        });
        break;

      case 'manager':
        roleData = await Manager.create({
          userId: newUser._id,
          agencyId: validatedData.roleSpecificData.agencyId,
          nbManager: validatedData.roleSpecificData.nbManager,
          activity: validatedData.roleSpecificData.activity,
          status: 'active'
        });
        break;

      case 'municipality':
        roleData = await MunicipalityManager.create({
          userId: newUser._id,
          status: 'active'
        });
        break;

      case 'super_admin':
        roleData = await Admin.create({
          userId: newUser._id,
          status: 'active'
        });
        break;

      default:
        throw new Error(`Rôle non supporté: ${role}`);
    }

    return {
      user: newUser,
      roleData: roleData,
      role: role
    };
  }
}

module.exports = new RegistrationService();

