// ========================================
// services/authService.js - VERSION AVEC MANAGER AUTO
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

      // 5️⃣ Créer l'utilisateur d'abord, puis les données de rôle
      const result = await this.createUserFirst(validatedData, role);

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
    if (data.name || data.agencyDescription) {
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
    const commonFields = ['firstName', 'lastName', 'email', 'password', 'phone', 'acceptTerms'];
    const missing = commonFields.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Champs obligatoires manquants: ${missing.join(', ')}`);
    }

    // Vérifier que acceptTerms est true
    if (data.acceptTerms !== true) {
      throw new Error('Vous devez accepter les conditions d\'utilisation');
    }

    // Structure de base
    const validated = {
      // Données utilisateur
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
      phone: data.phone.trim(),
      address: data.address || {},
      role: role,
      acceptTerms: data.acceptTerms,
      receiveOffers: data.receiveOffers || false,
      
      // Données spécifiques au rôle
      roleSpecificData: {}
    };

    // Validation spécifique selon le rôle
    switch (role) {
      case 'client':
        validated.roleSpecificData = {};
        break;

      case 'agency':
        if (!data.name) {
          throw new Error('Une agence nécessite un nom (name)');
        }
        validated.roleSpecificData = {
          name: data.name.trim(),
          agencyDescription: data.agencyDescription || '',
          zoneActivite: data.zoneActivite || '',
          slogan: data.slogan || ''
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
        // Vérifier si une agence avec le même nom existe déjà
        const existingAgency = await Agency.findOne({ 
          name: validatedData.roleSpecificData.name 
        });
        if (existingAgency) {
          throw new Error('Une agence avec ce nom existe déjà');
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
   * 🏗️ Crée l'utilisateur d'abord, puis les données de rôle
   */
  async createUserFirst(validatedData, role) {
    let newUser;
    let roleData;
    let ownerManager; // Pour stocker le manager propriétaire

    try {
      // 1️⃣ Créer l'utilisateur d'abord
      const userData = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        password: validatedData.password,
        phone: validatedData.phone,
        address: validatedData.address,
        role: role,
        status: 'active',
        acceptTerms: validatedData.acceptTerms,
        receiveOffers: validatedData.receiveOffers,
      };

      // Ajouter le nom pour les agences (optionnel, pour référence rapide)
      if (role === 'agency' && validatedData.roleSpecificData.name) {
        userData.agencyName = validatedData.roleSpecificData.name;
      }

      newUser = await User.create(userData);

      // 2️⃣ Maintenant créer les données de rôle spécifique
      switch (role) {
        case 'client':
          const qrToken = this.generateQRToken();
          const qrCodeImage = await QRCode.toDataURL(qrToken);
          
          roleData = await Client.create({
            userId: newUser._id,
            qrCode: qrToken,
            qrCodeImage: qrCodeImage,
            status: 'active'
          });
          break;

        case 'agency':
          // CRÉATION DE L'AGENCE SEULEMENT
          roleData = await Agency.create({
            userId: newUser._id,
            name: validatedData.roleSpecificData.name,
            agencyDescription: validatedData.roleSpecificData.agencyDescription,
            zoneActivite: validatedData.roleSpecificData.zoneActivite,
            slogan: validatedData.roleSpecificData.slogan,
            gestionnaires: [],
            documents: [],
            status: 'active'
          });

          // CRÉATION AUTOMATIQUE DU MANAGER PROPRIÉTAIRE
          ownerManager = await Manager.create({
            userId: newUser._id,
            agencyId: roleData._id,
            nbManager: 1,
            activity: validatedData.roleSpecificData.zoneActivite || 'Gestion générale',
            isOwner: true, // ← PROPRIÉTAIRE PAR DÉFAUT
            status: 'active'
          });

          // METTRE À JOUR L'AGENCE AVEC LA RÉFÉRENCE DU MANAGER PROPRIÉTAIRE
          await Agency.findByIdAndUpdate(
            roleData._id,
            { 
              $push: { gestionnaires: ownerManager._id },
              $set: { ownerManagerId: ownerManager._id } // Optionnel: stocker l'ID du propriétaire
            }
          );
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
            isOwner: false, // ← Pas propriétaire par défaut
            status: 'active'
          });

          // Ajouter le manager à la liste des gestionnaires de l'agence
          await Agency.findByIdAndUpdate(
            validatedData.roleSpecificData.agencyId,
            { $push: { gestionnaires: roleData._id } }
          );
          break;

        case 'municipality':
          roleData = await MunicipalityManager.create({
            userId: newUser._id,
            municipalityCode: validatedData.roleSpecificData.municipalityCode,
            region: validatedData.roleSpecificData.region,
            status: 'active'
          });
          break;

        case 'super_admin':
          roleData = await Admin.create({
            userId: newUser._id,
            adminLevel: validatedData.roleSpecificData.adminLevel,
            permissions: validatedData.roleSpecificData.permissions,
            status: 'active'
          });
          break;

        default:
          throw new Error(`Rôle non supporté: ${role}`);
      }

      // 3️⃣ Mettre à jour l'utilisateur avec la référence vers les données de rôle
      newUser.roleRef = roleData._id;
      await newUser.save();

      return {
        user: newUser,
        roleData: roleData,
        ownerManager: ownerManager, // Retourner aussi le manager propriétaire si créé
        role: role
      };

    } catch (error) {
      // 🧹 NETTOYAGE AUTOMATIQUE
      if (newUser && newUser._id) {
        console.log(`🧹 Nettoyage automatique: suppression de l'utilisateur ${newUser._id} suite à l'échec de création des données de rôle`);
        await User.findByIdAndDelete(newUser._id);
      }
      
      if (roleData && roleData._id) {
        await this.cleanupRoleData(role, roleData._id);
      }
      
      // Nettoyer aussi le manager propriétaire si créé
      if (ownerManager && ownerManager._id) {
        await Manager.findByIdAndDelete(ownerManager._id);
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
      console.log(`✅ Données de rôle ${role} (${roleId}) nettoyées avec succès`);
    } catch (cleanupError) {
      console.error('❌ Erreur lors du nettoyage des données de rôle:', cleanupError);
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