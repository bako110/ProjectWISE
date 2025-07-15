import User from '../models/User.js';
import Agency from '../models/Agency.js';
import Client from '../models/Client.js';
import Collector from '../models/Collector.js';
import MunicipalManager from '../models/MunicipalManager.js';

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Vérifier l'existence de l'utilisateur
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    // Mettre à jour la date de modification du compte
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
        updated = await Collector.findOneAndUpdate(
          { userId },
          { $set: filterCollectorFields(updates) },
          { new: true, runValidators: true }
        );
        break;

      case 'mairie':
        updated = await MunicipalManager.findOneAndUpdate(
          { userId },
          { $set: filterMunicipalFields(updates) },
          { new: true, runValidators: true }
        );
        break;

      default:
        return res.status(400).json({ message: 'Rôle inconnu' });
    }

    if (!updated) return res.status(404).json({ message: 'Profil non trouvé pour ce rôle' });

    return res.status(200).json({
      message: 'Profil mis à jour avec succès',
      profile: updated
    });

  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 🎯 Champs à mettre à jour pour chaque modèle

// ✅ Client
const filterClientFields = d => ({
  ...(d.firstName && { firstName: d.firstName }),
  ...(d.lastName && { lastName: d.lastName }),
  ...(d.phone && { phone: d.phone }),
  ...(d.agencyId && { agencyId: d.agencyId }),
  ...(d.subscribedAgencyId && { subscribedAgencyId: d.subscribedAgencyId }),
  ...(d.subscriptionStatus && { subscriptionStatus: d.subscriptionStatus }),
  ...(d.serviceAddress && { serviceAddress: d.serviceAddress })
});

// ✅ Agency
const filterAgencyFields = d => ({
  ...(d.name && { name: d.name }),
  ...(d.contactPerson && { contactPerson: d.contactPerson }),
  ...(d.phone && { phone: d.phone }),
  ...(d.licenseNumber && { licenseNumber: d.licenseNumber }),
  ...(d.description && { description: d.description }),
  ...(d.location && { location: d.location }),
  ...(d.coveredAreas && { coveredAreas: d.coveredAreas }),
  ...(d.isVerified !== undefined && { isVerified: d.isVerified }),
  ...(d.collectors && { collectors: d.collectors }),
  ...(d.clients && { clients: d.clients })
});

// ✅ Collector
const filterCollectorFields = d => ({
  ...(d.firstName && { firstName: d.firstName }),
  ...(d.lastName && { lastName: d.lastName }),
  ...(d.phone && { phone: d.phone }),
  ...(d.agencyId && { agencyId: d.agencyId }),
  ...(d.assignedAreas && { assignedAreas: d.assignedAreas }),
  ...(d.vehicleInfo && { vehicleInfo: d.vehicleInfo }),
  ...(d.isManager !== undefined && { isManager: d.isManager }) // facultatif
});

// ✅ Municipal Manager
const filterMunicipalFields = d => ({
  ...(d.firstName && { firstName: d.firstName }),
  ...(d.lastName && { lastName: d.lastName }),
  ...(d.phone && { phone: d.phone }),
  ...(d.agencyId && { agencyId: d.agencyId }),
  ...(d.commune && { commune: d.commune }),
  ...(d.managedZones && { managedZones: d.managedZones }),
  ...(d.position && { position: d.position })
});
