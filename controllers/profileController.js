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
  ...(d.subscriptionStatus && { subscriptionStatus: d.subscriptionStatus }),
  ...(d.serviceAddress && { serviceAddress: d.serviceAddress }),
  ...(typeof d.termsAccepted === 'boolean' && { termsAccepted: d.termsAccepted }),
  ...(typeof d.receiveOffers === 'boolean' && { receiveOffers: d.receiveOffers }),
});

const filterAgencyFields = d => ({
  ...(d.name && { name: d.name }),
  ...(d.description && { description: d.description }),
  ...(d.phone && { phone: d.phone }),
  ...(d.email && { email: d.email }),
  ...(d.logo && { logo: d.logo }),
  ...(d.address && { address: d.address }),
  ...(d.serviceZones && { serviceZones: d.serviceZones }),
  ...(d.services && { services: d.services }),
  ...(d.employees && { employees: d.employees }),
  ...(d.schedule && { schedule: d.schedule }),
  ...(d.rating !== undefined && { rating: d.rating }),
  ...(d.totalClients !== undefined && { totalClients: d.totalClients }),
  ...(typeof d.termsAccepted === 'boolean' && { termsAccepted: d.termsAccepted }),
  ...(typeof d.receiveOffers === 'boolean' && { receiveOffers: d.receiveOffers }),
  ...(d.isActive !== undefined && { isActive: d.isActive }),
});

const filterEmployeeFields = d => ({
  ...(d.firstName && { firstName: d.firstName }),
  ...(d.lastName && { lastName: d.lastName }),
  ...(d.email && { email: d.email }),
  ...(d.phone && { phone: d.phone }),
  ...(d.agencyId && { agencyId: d.agencyId }),
  ...(d.role && { role: d.role }), // manager ou collector
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
  ...(d.commune && { commune: d.commune }),
  ...(d.managedZones && { managedZones: d.managedZones }),
  ...(d.position && { position: d.position }),
});

const filterAdminFields = d => ({
  ...(d.firstname && { firstname: d.firstname }),
  ...(d.lastname && { lastname: d.lastname }),
  ...(d.phone && { phone: d.phone }),
  ...(d.isActive !== undefined && { isActive: d.isActive }),
});
