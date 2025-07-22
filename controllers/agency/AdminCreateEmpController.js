import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Employee from '../../models/Agency/Employee.js';
import Agency from '../../models/Agency/Agency.js'; // <-- Ajout ici
import ServiceZone from '../../models/Agency/ServiceZone.js';
import crypto from 'crypto';
import { sendMail } from '../../utils/resetcodemail.js';

export const createEmployee = async (req, res) => {
  // Démarrer une session pour la transaction
  const session = await mongoose.startSession();
  
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

    const agencyId = req.user.id; // L'agence actuellement connectée (via middleware)

    // Validations
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

    // 🔎 Récupération de l'agence
    const agency = await Agency.findOne({ userId: agencyId });
    if (!agency) {
      return res.status(404).json({ message: "Agence introuvable." });
    }
    const agencyName = agency?.agencyName || 'Votre agence';

    // 🔐 Génération du mot de passe
    const generatedPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    // 🚀 Démarrer la transaction
    await session.withTransaction(async () => {
      
      // 👤 Création de l'utilisateur (User) dans la transaction
      const [newUser] = await User.create([{
        email,
        password: hashedPassword,
        role,
        isActive: true
      }], { session });

      // 👥 Création de l'employé (Employee) dans la transaction
      const [newEmployee] = await Employee.create([{
        userId: newUser._id,
        firstName,
        lastName,
        phone,
        zones,
        agencyId: agency._id,
        isActive: true,
        hiredAt: new Date(),
        avatar
      }], { session });

      // 🔁 Mise à jour de l'agence : ajout de l'employé dans la liste
      await Agency.findByIdAndUpdate(
        agency._id, 
        { $push: { employees: newEmployee._id } },
        { session }
      );

      // Stocker les données pour l'envoi d'email après la transaction
      req.tempData = {
        newUser,
        newEmployee,
        generatedPassword,
        firstName,
        email,
        agencyName
      };
    });

    // 📧 Envoi des identifiants au nouvel employé (après la transaction)
    const { newUser, newEmployee } = req.tempData;
    
    await sendMail(
      email,
      `🎉 Bienvenue chez ${agencyName} - Vos identifiants`,
      {
        firstName,
        email,
        password: generatedPassword,
        agencyName
      }
    );

    return res.status(201).json({
      message: `${role} créé avec succès.`,
      employeeId: newEmployee._id,
      userId: newUser._id,
      email: newUser.email,
      employee: {
        _id: newEmployee._id,
        userId: newUser._id,
        firstName,
        lastName,
        agencyName,
        phone,
        zones,
        isActive: true,
        hiredAt: newEmployee.hiredAt
      }
    });

  } catch (error) {
    console.error('Erreur création employé :', error);
    
    // En cas d'erreur, la transaction est automatiquement annulée
    // Aucun User ni Employee ne sera créé
    
    return res.status(500).json({
      message: 'Erreur lors de la création de l\'employé. Aucune donnée n\'a été sauvegardée.',
      error: error.message
    });
  } finally {
    // Fermer la session
    await session.endSession();
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
