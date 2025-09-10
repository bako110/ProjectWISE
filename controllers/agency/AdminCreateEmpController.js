import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Employee from '../../models/Agency/Employee.js';
import Agency from '../../models/Agency/Agency.js'; // <-- Ajout ici
import Service from '../../models/Agency/Service.js';
import Client from '../../models/clients/Client.js';
import Report from '../../models/report/report.js';
import crypto from 'crypto';
import { sendMail } from '../../utils/resetcodemail.js';

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

    const agencyUserId = req.user.id; // l'utilisateur (admin agence) connecté

    // Validation du rôle
    if (!['manager', 'collector'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide. Doit être manager ou collector.' });
    }

    // Validation des champs
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Prénom, nom et email sont obligatoires.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }

    // Trouver l'agence par userId
    const agency = await Agency.findOne({ userId: agencyUserId });
    if (!agency) {
      return res.status(404).json({ message: 'Agence introuvable pour cet utilisateur.' });
    }

    const agencyName = agency.agencyName || 'Votre agence';

    // Générer et hasher mot de passe
    const generatedPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    // Créer utilisateur
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
      isActive: true
    });

    // Créer employé
    const newEmployee = await Employee.create({
      userId: newUser._id,
      firstName,
      lastName,
      phone,
      zones,
      role,
      agencyId: agency._id,
      isActive: true,
      hiredAt: new Date(),
      avatar
    });

    // 🧠 Ajouter l'employé à la liste de l'agence
    await Agency.findByIdAndUpdate(
      agency._id,
      { $push: { employees: newEmployee._id } },
      { new: true }
    );

    // Envoyer mail
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
      email: newUser.email
    });

  } catch (error) {
    console.error('Erreur création employé :', error);
    return res.status(500).json({
      message: 'Erreur serveur.',
      error: error.message
    });
  }
};


export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phone, role, zones, isActive } = req.body;
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employé non trouvé.' });
        }
        // Mettre à jour les informations de l'employé
        employee.firstName = firstName || employee.firstName; 
        employee.lastName = lastName || employee.lastName;
        employee.phone = phone || employee.phone;
        employee.role = role || employee.role;
        employee.zones = zones || employee.zones;
        
        await employee.save();
        return res.status(200).json({
            message: 'Employé mis à jour avec succès.',
            employee
        });
    } catch (error) {
        console.error('Erreur mise à jour employé:', error);
        return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
}

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé.' });
    }
    // Supprimer l'employé
    await Employee.findByIdAndDelete(id);
    // Supprimer l'utilisateur associé
    await User.findByIdAndDelete(employee.userId);
    return res.status(200).json({ message: 'Employé supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur suppression employé:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
}

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

export const statistics = async (req, res) => {
  try {
    const { agencyId } = req.params; 

    if (!agencyId) {
      return res.status(400).json({
        success: false,
        message: "agencyId requis"
      });
    }

    // Comptage des employés collecteurs pour cette agence
    const totalEmployees = await Employee.countDocuments({ agency: agencyId, role: 'collector' });

    // Comptage des clients pour cette agence
    const totalClients = await Client.countDocuments({ agency: agencyId });

    // Comptage des signalements pour cette agence
    const totalSignalements = await Report.countDocuments({ agency: agencyId });

    // Comptage des zones/services pour cette agence
    const totalZones = await Service.countDocuments({ agency: agencyId });

    // Optionnel : Signalements par statut (pending / resolved)
    const pendingSignalements = await Report.countDocuments({ agency: agencyId, status: 'pending' });
    const resolvedSignalements = await Report.countDocuments({ agency: agencyId, status: 'resolved' });

    res.status(200).json({
      totalEmployees,
      totalClients,
      totalSignalements,
      pendingSignalements,
      resolvedSignalements,
      totalZones,
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
