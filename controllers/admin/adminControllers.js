import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Admin from '../../models/admin/admin.js';
import Agency from '../../models/Agency/Agency.js';
import Employee from '../../models/Agency/Employee.js';
import Client from '../../models/clients/Client.js';
import Collection from '../../models/collections/Collection.js';
import Mairie from '../../models/Mairies/MunicipalManager.js';
import Report from '../../models/report/report.js'


export const registerSuperAdmin = async (req, res) => {
  const { firstname, lastname, email, password, superAdminKey } = req.body;

  // Vérification de la clé secrète pour autoriser la création d'un super admin
  if (superAdminKey !== process.env.SUPER_ADMIN_SECRET) {
    return res.status(403).json({
      message: 'Clé secrète super admin invalide.',
      error: 'INVALID_SUPER_ADMIN_KEY'
    });
  }

  // Validation des champs requis
  if (!firstname || !lastname || !email || !password || password.length < 8) {
    return res.status(400).json({
      message: 'Prénom, nom, email et mot de passe valides requis (8 caractères min).',
      error: 'INVALID_INPUT'
    });
  }

  try {
    // Vérifier que l'email n'existe pas déjà
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: 'Email déjà utilisé.',
        error: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur avec rôle super_admin
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'super_admin',
      isActive: true
    });

    // Créer le profil Admin lié à cet utilisateur
    const adminProfile = await Admin.create({
      userId: user._id,
      firstName,
      lastName,
      isActive: true
    });

    // Répondre avec succès
    res.status(201).json({
      message: 'Super admin créé avec succès',
      userId: user._id,
      adminProfileId: adminProfile._id,
      role: user.role,
      success: true
    });

  } catch (error) {
    console.error('Erreur création super admin:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la création du super admin',
      error: 'SERVER_ERROR'
    });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const {role } = req.params;
    const employees = await Employee.find({role: role});
    if (!employees || employees.length === 0) {
      return res.status(404).json({
        message: 'Aucun employé trouvé pour ce rôle.',
        error: 'NO_EMPLOYEES_FOUND'
      });
    }
    res.status(200).json({
      message: 'Liste des employés récupérée avec succès',
      employees,
      success: true
    });
  } catch (error) {
    console.error('Erreur récupération employés:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des employés',
      error: 'SERVER_ERROR'
    });
  }
};

export const statistics = async (req, res) => {
  try {
    // Récupérer les statistiques des admins (inchangées)
    const totalAgencies = await Agency.countDocuments();
    const activeAgencies = await Agency.countDocuments({ isActive: true });
    const totalMunicipalities = await Mairie.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalCollectors = await Employee.countDocuments({ role: 'collector' });
    const activeClients = await Client.countDocuments({
      subscriptionHistory: { $elemMatch: { status: 'active' } }
    });
    const totalCollections = await Collection.countDocuments();
    const completeCollections = await Collection.countDocuments({ status: 'completed' });

    // 📌 Signalements par CLIENTS
    const totalClientReports = await Report.countDocuments({ client: { $ne: null } });
    const pendingClientReports = await Report.countDocuments({ client: { $ne: null }, status: 'pending' });
    const resolvedClientReports = await Report.countDocuments({ client: { $ne: null }, status: 'resolved' });

    // 📌 Signalements par COLLECTEURS
    const totalCollectorReports = await Report.countDocuments({ collector: { $ne: null } });
    const pendingCollectorReports = await Report.countDocuments({ collector: { $ne: null }, status: 'pending' });
    const resolvedCollectorReports = await Report.countDocuments({ collector: { $ne: null }, status: 'resolved' });

    res.status(200).json({
      totalAgencies,
      activeAgencies,
      totalMunicipalities,
      totalClients,
      totalCollectors,
      activeClients,
      totalCollections,
      completeCollections,

      // ✅ Partie clients
      reportsFromClients: {
        total: totalClientReports,
        pending: pendingClientReports,
        resolved: resolvedClientReports
      },

      // ✅ Partie collecteurs
      reportsFromCollectors: {
        total: totalCollectorReports,
        pending: pendingCollectorReports,
        resolved: resolvedCollectorReports
      },

      message: 'Statistiques récupérées avec succès',
      success: true
    });
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des statistiques',
      error: 'SERVER_ERROR'
    });
  }
};

