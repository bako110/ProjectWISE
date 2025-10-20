// ========================================
// services/authService.js
// ========================================
const User = require('../models/users');
const Client = require('../models/client');
const Agency = require('../models/agency');
const Collector = require('../models/collector');
const Manager = require('../models/manager');
const MunicipalityManager = require('../models/municipalityManager');
const Admin = require('../models/admin');
const QRCode = require('qrcode');

class RegistrationService {
  
  /**
   * 🎯 POINT D'ENTRÉE UNIQUE - Inscription avec validation stricte
   */
  async register(rawData) {
    try {
      // 1️⃣ Détecter et valider le rôle (obligatoire)
      const role = this.detectAndValidateRole(rawData);
      
      // 2️⃣ Extraire et valider les données selon le rôle
      const validatedData = this.validateAndExtractData(rawData, role);

      // 3️⃣ Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser) {
        throw new Error('Cet email est déjà utilisé');
      }

      // 4️⃣ Vérifier les dépendances des autres tables AVANT création
      await this.validateDependencies(validatedData, role);

      // 5️⃣ Créer les données de rôle d'abord, puis l'utilisateur
      const result = await this.createRoleDataFirst(validatedData, role);

      return result;

    } catch (error) {
      throw error;
    }
  }

  /**
   * 🔍 Détecte et valide le rôle (plus strict)
   */
  detectAndValidateRole(data) {
    const validRoles = ['client', 'agency', 'collector', 'manager', 'municipality', 'super_admin'];
    
    // Priorité 1: Rôle explicite
    if (data.role) {
      const role = data.role.toLowerCase();
      if (!validRoles.includes(role)) {
        throw new Error(`Rôle invalide: ${role}. Rôles valides: ${validRoles.join(', ')}`);
      }
      return role;
    }

    // Priorité 2: Détection par champs spécifiques (plus stricte)
    if ((data.agencyName || data.name) && data.zoneActivite && data.clientId && data.collectorId) {
      return 'agency';
    }
    
    if (data.agencyId && (data.planning || data.collection)) {
      return 'collector';
    }
    
    if (data.agencyId && data.nbManager) {
      return 'manager';
    }
    
    if (data.isSuperAdmin || data.adminLevel) {
      return 'super_admin';
    }
    
    if (data.municipalityCode) {
      return 'municipality';
    }

    // Aucun rôle détecté - on refuse l'inscription
    throw new Error('Impossible de déterminer le rôle. Veuillez spécifier un rôle valide ou fournir les champs nécessaires.');
  }

  /**
   * ✅ Valide et extrait les données selon le rôle
   */
  validateAndExtractData(data, role) {
    // Champs communs obligatoires pour tous les rôles
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

    // Validation spécifique selon le rôle
    switch (role) {
      case 'client':
        // Aucune donnée supplémentaire requise
        break;

      case 'agency':
        if (!data.clientId || !data.collectorId) {
          throw new Error('Une agence nécessite clientId et collectorId');
        }
        validated.roleSpecificData = {
          name: data.name || data.agencyName,
          agencyName: data.agencyName || data.name,
          agencyDescription: data.agencyDescription || '',
          zoneActivite: data.zoneActivite,
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
        if (!data.municipalityCode) {
          throw new Error('Un gestionnaire municipal nécessite un code municipal');
        }
        validated.roleSpecificData = {
          municipalityCode: data.municipalityCode,
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
        throw new Error(`Rôle non supporté: ${role}`);
    }

    return validated;
  }

  /**
   * 🔗 Vérifie les dépendances des autres tables
   */
  async validateDependencies(validatedData, role) {
    switch (role) {
      case 'agency':
        // Vérifier que le client existe
        const clientExists = await Client.findById(validatedData.roleSpecificData.clientId);
        if (!clientExists) {
          throw new Error('Le client spécifié n\'existe pas');
        }
        
        // Vérifier que le collecteur existe
        const collectorExists = await Collector.findById(validatedData.roleSpecificData.collectorId);
        if (!collectorExists) {
          throw new Error('Le collecteur spécifié n\'existe pas');
        }
        break;

      case 'collector':
      case 'manager':
        // Vérifier que l'agence existe
        const agencyExists = await Agency.findById(validatedData.roleSpecificData.agencyId);
        if (!agencyExists) {
          throw new Error('L\'agence spécifiée n\'existe pas');
        }
        break;

      case 'municipality':
        // Vérifier l'unicité du code municipal
        const existingMunicipality = await MunicipalityManager.findOne({ 
          municipalityCode: validatedData.roleSpecificData.municipalityCode 
        });
        if (existingMunicipality) {
          throw new Error('Ce code municipal est déjà utilisé');
        }
        break;
    }
  }

  /**
   * 🏗️ Crée les données de rôle d'abord, puis l'utilisateur
   */
  async createRoleDataFirst(validatedData, role) {
    let roleData;
    let newUser;

    try {
      // 1️⃣ Créer les données de rôle spécifique d'abord
      switch (role) {
        case 'client':
          // Générer le token QR Code
          const qrToken = this.generateQRToken();
          // Générer l'image QR Code
          const qrCodeImage = await QRCode.toDataURL(qrToken);
          
          roleData = await Client.create({
            qrCode: qrToken,
            qrCodeImage: qrCodeImage,
            status: 'active'
          });
          break;

        case 'agency':
          roleData = await Agency.create({
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
            agencyId: validatedData.roleSpecificData.agencyId,
            planning: validatedData.roleSpecificData.planning,
            collection: validatedData.roleSpecificData.collection,
            status: 'active'
          });
          break;

        case 'manager':
          roleData = await Manager.create({
            agencyId: validatedData.roleSpecificData.agencyId,
            nbManager: validatedData.roleSpecificData.nbManager,
            activity: validatedData.roleSpecificData.activity,
            status: 'active'
          });
          break;

        case 'municipality':
          roleData = await MunicipalityManager.create({
            municipalityCode: validatedData.roleSpecificData.municipalityCode,
            region: validatedData.roleSpecificData.region,
            status: 'active'
          });
          break;

        case 'super_admin':
          roleData = await Admin.create({
            adminLevel: validatedData.roleSpecificData.adminLevel,
            permissions: validatedData.roleSpecificData.permissions,
            status: 'active'
          });
          break;

        default:
          throw new Error(`Rôle non supporté: ${role}`);
      }

      // 2️⃣ Maintenant créer l'utilisateur avec la référence vers les données de rôle
      const userData = {
        firstname: validatedData.firstname,
        lastname: validatedData.lastname,
        email: validatedData.email,
        password: validatedData.password,
        phone: validatedData.phone,
        address: validatedData.address,
        role: role,
        status: 'active',
        // Référence vers les données de rôle
        roleRef: roleData._id
      };

      // Ajouter les champs spéciaux pour agency
      if (role === 'agency' && validatedData.roleSpecificData.agencyName) {
        userData.agencyName = validatedData.roleSpecificData.agencyName;
      }

      newUser = await User.create(userData);

      // 3️⃣ Mettre à jour les données de rôle avec l'ID utilisateur
      roleData.userId = newUser._id;
      await roleData.save();

      return {
        user: newUser,
        roleData: roleData,
        role: role
      };

    } catch (error) {
      // En cas d'erreur, nettoyer les données créées
      if (roleData && roleData._id) {
        await this.cleanupRoleData(role, roleData._id);
      }
      if (newUser && newUser._id) {
        await User.findByIdAndDelete(newUser._id);
      }
      throw error;
    }
  }

  /**
   * 🧹 Nettoie les données de rôle en cas d'erreur
   */
  async cleanupRoleData(role, roleId) {
    try {
      switch (role) {
        case 'client':
          await Client.findByIdAndDelete(roleId);
          break;
        case 'agency':
          await Agency.findByIdAndDelete(roleId);
          break;
        case 'collector':
          await Collector.findByIdAndDelete(roleId);
          break;
        case 'manager':
          await Manager.findByIdAndDelete(roleId);
          break;
        case 'municipality':
          await MunicipalityManager.findByIdAndDelete(roleId);
          break;
        case 'super_admin':
          await Admin.findByIdAndDelete(roleId);
          break;
      }
    } catch (cleanupError) {
      console.error('Erreur lors du nettoyage:', cleanupError);
    }
  }

  /**
   * 🔢 Génère un token unique pour le QR Code (uniquement pour les clients)
   */
  generateQRToken() {
    return `CLIENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new RegistrationService();