import Report from '../../models/report/report.js';
import Client from '../../models/clients/Client.js';
import Employee from '../../models/Agency/Employee.js';
import Agency from '../../models/Agency/Agency.js';

/**
 * 📌 Créer un signalement
 * (soit par un client, soit par un collecteur)
 */
export const createReport = async (req, res) => {
  try {
    const { clientId, collectorId, agencyId, type, description, severity } = req.body;

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
      status: "pending"
    });

    await report.save();

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