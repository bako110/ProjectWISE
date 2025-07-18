import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Employee from '../../models/Agency/Employee.js';
import crypto from 'crypto'; // pour générer le mot de passe

export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      zones = [],
      avatar
    } = req.body;

    const agencyId = req.user.id;

    if (!['manager', 'collector'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide. Doit être manager ou collector.' });
    }

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Prénom, nom et email sont obligatoires.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }

    // 🔐 Génération d'un mot de passe aléatoire
    const generatedPassword = crypto.randomBytes(6).toString('hex'); // 12 caractères
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    // 👤 Création de l'utilisateur
    const newUser = await User.create({
      nom: lastName,
      prenom: firstName,
      email,
      password: hashedPassword,
      role,
      agencyId,
      isActive: true
    });

    // 👥 Création de l'employé
    const newEmployee = await Employee.create({
      userId: newUser._id,
      firstName,
      lastName,
      email,
      phone,
      role,
      zones,
      avatar,
      isActive: true,
      hiredAt: new Date()
    });

    // ✅ Réponse avec mot de passe généré
    return res.status(201).json({
      message: `${role} créé avec succès.`,
      employeeId: newEmployee._id,
      userId: newUser._id,
      email: newUser.email,
      generatedPassword // ← à afficher ou à envoyer par email si besoin
    });

  } catch (error) {
    console.error('Erreur création employee:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création.', error: error.message });
  }
};
