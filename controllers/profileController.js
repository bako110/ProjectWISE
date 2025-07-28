import User from '../models/User.js';
import Agency from '../models/Agency/Agency.js';
import Client from '../models/clients/Client.js';
import Employee from '../models/Agency/Employee.js';
import MunicipalManager from '../models/Mairies/MunicipalManager.js';
import Admin from '../models/admin/admin.js';

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Chercher l'utilisateur (table User)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    // Mettre à jour date modification
    user.updatedAt = new Date();
    await user.save();

    let updated;

    switch (user.role) {
      case 'client':
        updated = await Client.findOneAndUpdate(
          { userId },
          { $set: filterClientFields(updates) },
          { new: true, runValidators: true }
        );
        break;

      case 'agency':
        updated = await Agency.findOneAndUpdate(
          { userId },
          { $set: filterAgencyFields(updates) },
          { new: true, runValidators: true }
        );
        break;

      case 'collector':
      case 'manager':
        // Collector et Manager sont stockés dans Employee
        updated = await Employee.findOneAndUpdate(
          { userId },
          { $set: filterEmployeeFields(updates) },
          { new: true, runValidators: true }
        );
        break;

      case 'municipality':
        updated = await MunicipalManager.findOneAndUpdate(
          { userId },
          { $set: filterMunicipalFields(updates) },
          { new: true, runValidators: true }
        );
        break;

      case 'super_admin':
        // Pour super_admin, mise à jour directe sur User (ajouter champs si besoin)
        updated = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
        break;

      case 'admin':
        updated = await Admin.findOneAndUpdate(
          { userId },
          { $set: filterAdminFields(updates) },
          { new: true, runValidators: true }
        );
        break;

      default:
        return res.status(400).json({ message: 'Rôle inconnu' });
    }

    if (!updated) return res.status(404).json({ message: 'Profil non trouvé pour ce rôle' });

    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      profile: updated
    });
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// --- Filtrage des champs à mettre à jour selon rôle ---

const filterClientFields = d => ({
  ...(d.firstName && { firstName: d.firstName }),
  ...(d.lastName && { lastName: d.lastName }),
  ...(d.phone && { phone: d.phone }),
  ...(d.agencyId && { agencyId: d.agencyId }),
  ...(d.subscribedAgencyId && { subscribedAgencyId: d.subscribedAgencyId }),
  // Adresse complète avec nouveaux champs
  ...(d.address && { 
    address: {
      ...(d.address.street && { street: d.address.street }),
      ...(d.address.doorNumber && { doorNumber: d.address.doorNumber }),
      ...(d.address.doorColor && { doorColor: d.address.doorColor }),
      ...(d.address.arrondissement && { arrondissement: d.address.arrondissement }),
      ...(d.address.sector && { sector: d.address.sector }),
      ...(d.address.neighborhood && { neighborhood: d.address.neighborhood }),
      ...(d.address.city && { city: d.address.city }),
      ...(d.address.postalCode && { postalCode: d.address.postalCode }),
      ...(d.address.latitude !== undefined && { latitude: d.address.latitude }),
      ...(d.address.longitude !== undefined && { longitude: d.address.longitude })
    }
  }),
  // Historiques (ajout uniquement, pas de remplacement complet)
  ...(d.subscriptionHistory && { $push: { subscriptionHistory: d.subscriptionHistory } }),
  ...(d.paymentHistory && { $push: { paymentHistory: d.paymentHistory } }),
  ...(d.nonPassageReports && { $push: { nonPassageReports: d.nonPassageReports } }),
  // Consentements
  ...(typeof d.acceptTerms === 'boolean' && { acceptTerms: d.acceptTerms }),
  ...(typeof d.receiveOffers === 'boolean' && { receiveOffers: d.receiveOffers }),
});

const filterAgencyFields = d => ({
  // Nouveaux champs firstName/lastName
  ...(d.firstName && { firstName: d.firstName }),
  ...(d.lastName && { lastName: d.lastName }),
  // Champs renommés
  ...(d.agencyName && { agencyName: d.agencyName }),
  ...(d.agencyDescription && { agencyDescription: d.agencyDescription }),
  ...(d.phone && { phone: d.phone }),
  ...(d.logo && { logo: d.logo }),
  ...(d.licenseNumber && { licenseNumber: d.licenseNumber }),
  // Adresse mise à jour
  ...(d.address && { 
    address: {
      ...(d.address.street && { street: d.address.street }),
      ...(d.address.arrondissement && { arrondissement: d.address.arrondissement }),
      ...(d.address.sector && { sector: d.address.sector }),
      ...(d.address.neighborhood && { neighborhood: d.address.neighborhood }),
      ...(d.address.city && { city: d.address.city }),
      ...(d.address.postalCode && { postalCode: d.address.postalCode }),
      ...(d.address.latitude !== undefined && { latitude: d.address.latitude }),
      ...(d.address.longitude !== undefined && { longitude: d.address.longitude })
    }
  }),
  // Relations (ajout/modification selon besoin)
  ...(d.members && { members: d.members }),
  ...(d.services && { services: d.services }),
  ...(d.services && { services: d.services }),
  ...(d.employees && { employees: d.employees }),
  ...(d.schedule && { schedule: d.schedule }),
  ...(d.collectors && { collectors: d.collectors }),
  ...(d.clients && { clients: d.clients }),
  // Statistiques
  ...(d.rating !== undefined && { rating: d.rating }),
  ...(d.totalClients !== undefined && { totalClients: d.totalClients }),
  // Consentements (nouveaux noms)
  ...(typeof d.acceptTerms === 'boolean' && { acceptTerms: d.acceptTerms }),
  ...(typeof d.receiveOffers === 'boolean' && { receiveOffers: d.receiveOffers }),
  ...(d.isActive !== undefined && { isActive: d.isActive }),
});

const filterEmployeeFields = d => ({
  ...(d.firstName && { firstName: d.firstName }),
  ...(d.lastName && { lastName: d.lastName }),
  ...(d.phone && { phone: d.phone }),
  ...(d.agencyId && { agencyId: d.agencyId }),
  // Le champ role n'existe plus dans le nouveau schéma
  ...(d.zones && { zones: d.zones }),
  ...(d.isActive !== undefined && { isActive: d.isActive }),
  ...(d.hiredAt && { hiredAt: d.hiredAt }),
  ...(d.avatar && { avatar: d.avatar }),
});

const filterMunicipalFields = d => ({
  ...(d.firstName && { firstName: d.firstName }),
  ...(d.lastName && { lastName: d.lastName }),
  ...(d.name && { name: d.name }),
  ...(d.phone && { phone: d.phone }),
  ...(d.agencyId && { agencyId: d.agencyId }),
  // Structure commune mise à jour
  ...(d.commune && { 
    commune: {
      ...(d.commune.region && { region: d.commune.region }),
      ...(d.commune.province && { province: d.commune.province }),
      ...(d.commune.name && { name: d.commune.name })
    }
  }),
  // Zones gérées avec nouvelle structure
  ...(d.managedZones && { managedZones: d.managedZones }),
  ...(d.position && { position: d.position }),
});

const filterAdminFields = d => ({
  // Champs renommés pour correspondre au nouveau schéma
  ...(d.firstName && { firstName: d.firstName }),
  ...(d.lastName && { lastName: d.lastName }),
  ...(d.phone && { phone: d.phone }),
  ...(d.isActive !== undefined && { isActive: d.isActive }),
});