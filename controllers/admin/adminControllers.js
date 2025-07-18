import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Admin from '../../models/admin/admin.js';

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
      firstname,
      lastname,
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
