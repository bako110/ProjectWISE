import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Employee from '../../models/Agency/Employee.js';
import Agency from '../../models/Agency/Agency.js';
import Service from '../../models/Agency/Service.js';
import Client from '../../models/clients/Client.js';
import Report from '../../models/report/report.js';
import crypto from 'crypto';
import { sendMail } from '../../utils/resetcodemail.js';

// 1. Création d'un employé
export const createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, zones = [], avatar } = req.body;
    const agencyUserId = req.user.id;

    // Validation des champs obligatoires
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Prénom, nom et email sont obligatoires.' });
    }
    if (!['manager', 'collector'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide. Doit être manager ou collector.' });
    }

    // Vérification de l'existence de l'email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }

    // Récupération de l'agence
    const agency = await Agency.findOne({ userId: agencyUserId });
    if (!agency) {
      return res.status(404).json({ message: 'Agence introuvable pour cet utilisateur.' });
    }

    // Génération et hashage du mot de passe
    const generatedPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    // Création de l'utilisateur
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
      isActive: true
    });

    // Création de l'employé
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

    // Mise à jour de l'agence
    await Agency.findByIdAndUpdate(
      agency._id,
      { $push: { employees: newEmployee._id } },
      { new: true }
    );

    // Envoi de l'email
    await sendMail(
      email,
      `🎉 Bienvenue chez ${agency.agencyName || 'Votre agence'} - Vos identifiants`,
      {
        firstName,
        email,
        password: generatedPassword,
        agencyName: agency.agencyName || 'Votre agence'
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

// 2. Mise à jour d'un employé
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role, zones, isActive } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé.' });
    }

    // Mise à jour des champs
    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.phone = phone || employee.phone;
    employee.role = role || employee.role;
    employee.zones = zones || employee.zones;
    employee.isActive = isActive !== undefined ? isActive : employee.isActive;

    await employee.save();

    return res.status(200).json({
      message: 'Employé mis à jour avec succès.',
      employee
    });
  } catch (error) {
    console.error('Erreur mise à jour employé:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// 3. Suppression d'un employé
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé.' });
    }

    // Suppression de l'employé et de l'utilisateur associé
    await Employee.findByIdAndDelete(id);
    await User.findByIdAndDelete(employee.userId);

    return res.status(200).json({ message: 'Employé supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur suppression employé:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// 4. Récupération d'un employé
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
};

// 5. Récupération de tous les employés d'une agence
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
};

// 6. Récupération des employés par rôle et agence
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
};

// 7. Récupération des statistiques
export const statistics = async (req, res) => {
  try {
    const agencyId = req.params.agencyId;
    let agency = null;
    if (agencyId) {
      agency = await Agency.findById(agencyId)
        .populate('employees')
        .populate('collectors')
        .populate('clients')
        .populate('services');
    }

    const totalEmployees = agency ? agency.employees.length : await Employee.countDocuments();
    const totalCollectors = agency ? agency.collectors.length : await Employee.countDocuments({ role: 'collector' });
    const totalClients = agency ? agency.clients.length : await Client.countDocuments();
    const totalZones = agency ? agency.serviceZones.length : 0;
    const totalServices = agency ? agency.services.length : await Service.countDocuments();

    const totalSignalements = await Report.countDocuments();
    const pendingSignalements = await Report.countDocuments({ status: 'pending' });
    const resolvedSignalements = await Report.countDocuments({ status: 'resolved' });

    res.json({
      success: true,
      message: "Statistiques récupérées avec succès",
      totalEmployees,
      totalCollectors,
      totalClients,
      totalZones,
      totalServices,
      totalSignalements,
      pendingSignalements,
      resolvedSignalements
    });
  } catch (err) {
    console.error('Erreur statistiques :', err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
