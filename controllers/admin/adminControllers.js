import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Admin from '../../models/admin/admin.js';
import Agency from '../../models/Agency/Agency.js';
import Employee from '../../models/Agency/Employee.js';
import Client from '../../models/clients/Client.js';
import Collection from '../../models/collections/Collection.js';
import Mairie from '../../models/Mairies/MunicipalManager.js';


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

export const statistics = async (req, res) => {
  try {
    // Récupérer les statistiques des admins
    const totalAgence = await Agency.countDocuments();
    const activeAgence = await Agency.countDocuments({ isActive: true });
    const totalMairie = await Mairie.countDocuments();
    const totalClient = await Client.countDocuments();
    const totalCollector = await Employee.countDocuments({ role: 'collector' });
    const activeClient = await Client.countDocuments({ subscriptionHistory: { $elemMatch: { status: 'active' } } });
    const totalCollection = await Collection.countDocuments();
    const completeCollection = await Collection.countDocuments({status: 'completed' });


    res.status(200).json({
      totalAgence,
      activeAgence,
      totalMairie,
      totalClient,
      totalCollector,
      activeClient,
      totalCollection,
      completeCollection,
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
}