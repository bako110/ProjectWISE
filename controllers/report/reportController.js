import Report from '../../models/report/report.js';
import Client from '../../models/clients/Client.js';
import Employee from '../../models/Agency/Employee.js';
import Agency from '../../models/Agency/Agency.js';
import Notification from '../../models/Notification.js';
import mongoose from 'mongoose';



/**
 * 📌 Créer un signalement
 * (soit par un client, soit par un collecteur)
 */
export const createReport = async (req, res) => {
  try {
    const { clientId, collectorId, agencyId, type, description, severity, photos } = req.body;

    if (!agencyId || !description || !type) {
      return res.status(400).json({ error: "Type, agence et description sont obligatoires." });
    }

    if ((clientId && collectorId) || (!clientId && !collectorId)) {
      return res.status(400).json({ error: "Le signalement doit être fait soit par un client soit par un collecteur, pas les deux." });
    }

    let client = null;
    let collector = null;

    if (clientId) {
      client = await Client.findById(clientId);
      if (!client) return res.status(404).json({ error: "Client introuvable" });
    }

    if (collectorId) {
      collector = await Employee.findById(collectorId);
      if (!collector || collector.role !== "collector") {
        return res.status(404).json({ error: "Collecteur introuvable ou invalide" });
      }
    }

    const agency = await Agency.findById(agencyId);
    if (!agency) return res.status(404).json({ error: "Agence introuvable" });

    // 🔥 Ajout de severity (avec valeur par défaut si rien n’est fourni)
    const report = new Report({
      client: clientId || null,
      collector: collectorId || null,
      agency: agencyId,
      type,
      description,
      severity: severity || "low", // 👈 valeur par défaut
      status: "pending",
      photos
    });

    await report.save();

    if (collectorId) {
      const message = "le collecter "+collector.lastName + " a signalé un problème: " + description;
      const notification = new Notification({ user: agency.userId, message, type: 'Signalement' });
      await notification.save();
    }

    if (clientId) {
      const message = "le client "+client.lastName + " client a signalé un problème: " + description;
      const notification = new Notification({ user: agency.userId, message, type: 'Signalement' });
      await notification.save();
    }

    res.status(201).json({ message: "Signalement créé avec succès ✅", report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📌 Récupérer tous les signalements d’une agence
 */
export const getReportsByAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;

    // Récupération des reports pour cette agence
    const reports = await Report.find({ agency: agencyId })
      .populate('client', 'firstName lastName phone')
      .populate('collector', 'firstName lastName role')
      .populate('agency', 'agencyName')
      .sort({ createdAt: -1 });

    // Comptage du nombre de reports
    const totalReports = reports.length;

    res.json({
      totalReports,
      reports,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📌 Récupérer les signalements d’un client
 */
export const getReportsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const reports = await Report.find({ client: clientId })
      .populate('collector', 'firstName lastName')
      .populate('agency', 'agencyName');

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📌 Récupérer les signalements d’un collecteur
 */
export const getReportsByCollector = async (req, res) => {
  try {
    const { collectorId } = req.params;

    const reports = await Report.find({ collector: collectorId })
      .populate('client', 'firstName lastName phone')
      .populate('agency', 'agencyName');

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📌 Mettre à jour le statut d’un signalement
 * (pending → in_progress → resolved)
 */
export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["pending", "resolved"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "Signalement introuvable" });

    report.status = status;
    await report.save();

    res.json({ message: "Statut mis à jour ✅", report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📌 Récupérer tous les signalements de toutes les agences
 */
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('client', 'firstName lastName phone')
      .populate('collector', 'firstName lastName role')
      .populate('agency', 'agencyName phone');

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/**
 * Assigner un employé (collector) à un report (signalement)
 * Route suggérée : PUT /api/reports/:reportId/assign
 * Body attendu : { employeeIds: ["<id1>", "<id2>", ...], status?: "in_progress" }
 */
export const assignEmployeeToReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { employeeIds } = req.body;

    // ✅ Validation
    if (!reportId || !mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ error: 'reportId invalide ou manquant.' });
    }
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: 'employeeIds invalide ou manquant.' });
    }

    // ✅ Charger le signalement
    const report = await Report.findById(reportId).populate('agency', 'agencyName');
    if (!report) return res.status(404).json({ error: 'Signalement introuvable.' });

    // ✅ Charger les employés
    const employees = await Employee.find({ _id: { $in: employeeIds } }).populate('agencyId', 'agencyName');
    if (!employees || employees.length === 0) {
      return res.status(404).json({ error: 'Aucun employé introuvable.' });
    }

    // ✅ Vérifier rôle si nécessaire
    const hasInvalidRole = employees.some(employee => employee.role && employee.role !== 'collector');
    if (hasInvalidRole) {
      return res.status(400).json({ error: 'L\'un des employés sélectionné n\'a pas le rôle de collecteur.' });
    }

    // ✅ Vérifier agence si besoin
    // if (report.agency && employees.some(employee => employee.agencyId && String(report.agency._id) !== String(employee.agencyId._id))) {
    //   return res.status(400).json({ error: 'L\'un des employés n\'appartient pas à la même agence que le signalement.' });
    // }

    // ✅ Assigner
    report.collectors = employees.map(employee => employee._id);

    // Si pas d'agence définie sur le report → on la prend depuis l'employé
    if (!report.agency && employees[0].agencyId) {
      report.agency = employees[0].agencyId._id;
    }

    // ✅ Enregistrer
    await report.save();

    // ✅ Populer pour la réponse
    await report.populate([
      { path: 'client', select: 'firstName lastName phone' },
      { path: 'collector', select: 'firstName lastName role' },
      { path: 'agency', select: 'agencyName' }
    ]);

    return res.status(200).json({
      message: '✅ Employé(s) assigné(s) avec succès au signalement.',
      report: {
        id: report._id,
        type: report.type,
        client: report.client ? `${report.client.firstName} ${report.client.lastName}` : null,
        collector: report.collector ? report.collector.map(collectorId => employees.find(employee => String(employee._id) === collectorId).firstName + ' ' + employees.find(employee => String(employee._id) === collectorId).lastName) : null,
        agency: report.agency ? report.agency.agencyName : null,
        description: report.description,
        updatedAt: report.updatedAt
      }
    });

  } catch (err) {
    console.error('Erreur assignEmployeeToReport:', err);
    return res.status(500).json({ error: 'Erreur serveur interne.', details: err.message });
  }
};
