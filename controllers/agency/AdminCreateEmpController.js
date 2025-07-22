import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Employee from '../../models/Agency/Employee.js';
import ServiceZone from '../../models/Agency/ServiceZone.js';
import crypto from 'crypto';

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

    const agencyId = req.user.id; // Vérifie bien que req.user est l'agence connectée

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

    // ✅ Vérifier que les zones appartiennent bien à l'agence
    // if (zones.length > 0) {
    //   const foundZones = await ServiceZone.find({ _id: { $in: zones }, agencyId });
    //   if (foundZones.length !== zones.length) {
    //     return res.status(403).json({ message: 'Une ou plusieurs zones ne vous appartiennent pas.' });
    //   }
    // }

    // 🔐 Génération mot de passe
    const generatedPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    // 👤 Création utilisateur
    const newUser = await User.create({
      nom: lastName,
      prenom: firstName,
      email,
      password: hashedPassword,
      role,
      agencyId,
      isActive: true
    });

    // 👥 Création employé lié à l’agence
    const newEmployee = await Employee.create({
      userId: newUser._id,
      firstName,
      lastName,
      email,
      phone,
      role,
      zones,
      avatar,
      agencyId,
      isActive: true,
      hiredAt: new Date()
    });

    return res.status(201).json({
      message: `${role} créé avec succès.`,
      employeeId: newEmployee._id,
      userId: newUser._id,
      email: newUser.email,
      generatedPassword
    });

  } catch (error) {
    console.error('Erreur création employee:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id).populate('userId', 'nom prenom email role isActive');

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé.' });
    }

    return res.status(200).json(employee);
  } catch (error) {
    console.error('Erreur récupération employé:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
}

export const getAllEmployees = async (req, res) => {
  try {
    const agencyId = req.params.agencyId; 
    const employees = await Employee.find({ agencyId })
      .populate('userId', 'nom prenom email role isActive')
      .sort({ createdAt: -1 });
    return res.status(200).json(employees);
  } catch (error) {
    console.error('Erreur récupération employés:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
}

export const getEmployeeByRoleAndAgency = async (req, res) => {
  try {
    const { role } = req.params;
    const agencyId = req.params.agencyId;
    const employees = await Employee.find({ role, agencyId })
      .populate('userId', 'nom prenom email role isActive')
      .sort({ createdAt: -1 });
    return res.status(200).json(employees);
  } catch (error) {
    console.error('Erreur récupération employés par rôle et agence:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
}
