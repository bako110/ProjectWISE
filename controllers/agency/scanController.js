import mongoose from 'mongoose';
import ScanReport from '../../models/Agency/ScanReport.js';
import Client from '../../models/clients/Client.js';
import Employee from '../../models/Agency/Employee.js';
import { sendQRCodeEmail } from '../../utils/qrcodemail.js';
import QRCode from 'qrcode';
import User from '../../models/User.js'

/**
 * Contrôleur : scan d’un QR code client
 * GET → récupère les infos client
 * POST → valide la collecte (status 'collected')
 */
export const scanBarrel = async (req, res) => {
  try {
    const clientId = req.query.clientId || req.query.id || req.body.clientId;
    const status = req.body.status || null; // fourni uniquement en POST

    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'ClientId invalide ou manquant.' });
    }

    const client = await Client.findById(clientId).select('firstName lastName phone address');
    if (!client) return res.status(404).json({ error: 'Client introuvable.' });

    // ----- GET → afficher infos client -----
    if (req.method === 'GET' || !status) {
      return res.status(200).json({
        message: '📌 Infos du client récupérées avec succès.',
        client: {
          id: client._id,
          name: `${client.firstName} ${client.lastName}`,
          phone: client.phone,
          address: client.address
        },
        actions: [
          { label: 'Valider collecte', action: 'POST /api/collecte/scan/validate' }
        ]
      });
    }

    // ----- POST → valider la collecte -----
    if (status !== 'collected') {
      return res.status(400).json({ error: 'Le statut doit être "collected".' });
    }

    // On suppose que le middleware a déjà rempli req.user
    // ⚡ Chercher le collecteur via userId (JWT donne User._id)
    const collector = await Employee.findOne({ userId: req.user.id }).populate('agencyId', 'agencyName');
    if (!collector) return res.status(404).json({ error: 'Collecteur introuvable.' });
    if (!collector.agencyId) return res.status(400).json({ error: 'Le collecteur doit appartenir à une agence.' });

    // Préparer le rapport
    const reportData = {
      clientId,
      collectorId: collector._id,
      agencyId: collector.agencyId._id,
      status: 'collected',
      scannedAt: new Date()
    };

    const scanReport = await new ScanReport(reportData).save();

    await scanReport.populate([
      { path: 'clientId', select: 'firstName lastName phone' },
      { path: 'collectorId', select: 'firstName lastName' },
      { path: 'agencyId', select: 'agencyName' }
    ]);

    return res.status(201).json({
      message: '✅ Collecte validée avec succès.',
      collector: `${collector.firstName} ${collector.lastName}`,
      agency: collector.agencyId.agencyName,
      client: `${client.firstName} ${client.lastName}`,
      report: scanReport
    });

  } catch (error) {
    console.error('❌ Erreur lors du scan :', error);
    return res.status(500).json({
      error: 'Erreur serveur interne.',
      details: error.message
    });
  }
};


/**
 * Récupérer l'historique des scans d’un collector
 */
export const getScanHistory = async (req, res) => {
  try {
    // const collectorId = req.user.id;
    const collectorId = req.params.collectorId;
    const { page = 1, limit = 20, status, clientId } = req.query;

    const query = { collectorId };

    if (status && ['collected', 'problem'].includes(status)) query.status = status;
    if (clientId && mongoose.Types.ObjectId.isValid(clientId)) query.clientId = clientId;

    const skip = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      ScanReport.find(query)
        .populate('clientId', 'firstName lastName phone')
        .populate('collectorId', 'firstName lastName')
        .populate('agencyId', 'agencyName')
        .sort({ scannedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ScanReport.countDocuments(query)
    ]);

    res.json({
      scans,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalScans: total,
        hasNext: skip + scans.length < total,
        hasPrev: Number(page) > 1
      }
    });

  } catch (error) {
    console.error('Erreur historique scan:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};


export const getScanReports = async (req, res) => {
  try {
    const { agencyId, clientId, collectorId } = req.query;

    const filters = {};

    if (agencyId) {
      filters.agencyId = agencyId;
    }

    if (clientId) {
      filters.clientId = clientId;
    }

    if (collectorId) {
      filters.collectorId = collectorId;
    }

    const reports = await ScanReport.find(filters)
      .populate([
        { path: 'clientId', select: 'firstName lastName phone' },
        { path: 'collectorId', select: 'firstName lastName' },
        { path: 'agencyId', select: 'agencyName' }
      ])
      .sort({ scannedAt: -1 });

    return res.status(200).json({
      count: reports.length,
      reports
    });

  } catch (error) {
    console.error('Erreur récupération scan reports:', error);
    return res.status(500).json({
      message: 'Erreur serveur interne.',
      error: error.message
    });
  }
};


export const regenerateQRCode = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Vérifie si le client existe
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        message: "Client introuvable",
        error: "CLIENT_NOT_FOUND"
      });
    }

    // Génère un nouveau token unique
    const qrToken = `https://projectwise.onrender.com/api/collecte/scan?id=${client._id}&ts=${Date.now()}`;
    const qrCodeImage = await QRCode.toDataURL(qrToken);

    // Mets à jour le client
    client.qrToken = qrToken;
    client.qrCodeImage = qrCodeImage;
    await client.save();

    // Récupérer l'email depuis la table User
    const user = await User.findById(client.userId);
    if (user && user.email) {
      await sendQRCodeEmail(user.email, client.firstName, qrCodeImage);
    }

    return res.status(200).json({
      message: "QR code régénéré avec succès",
      qrToken,
      qrCodeImage
    });
  } catch (error) {
    console.error("Erreur lors de la régénération du QR code:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la régénération du QR code",
      error: error.message
    });
  }
};

export const getAgencyPercentage = async (req, res) => {
  try {
    const { agencyId } = req.params;

    // Total des collectes (toutes agences)
    const totalCollectes = await ScanReport.countDocuments({ status: 'collected' });

    // Total des collectes pour cette agence
    const agenceCollectes = await ScanReport.countDocuments({ agencyId, status: 'collected' });

    // Calcul du pourcentage
    const pourcentage = totalCollectes > 0 ? (agenceCollectes / totalCollectes) * 100 : 0;

    res.json({
      agencyId,
      agenceCollectes,
      totalCollectes,
      pourcentage: pourcentage.toFixed(2) + '%' // formaté à 2 décimales
    });

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

export const getReportByAgency = async (req, res) => {
  try {
    const agencyId = req.params.agencyId;
    const startDate = new Date(new Date().setHours(0, 0, 0, 0));
    const endDate = new Date(new Date().setHours(23, 59, 59, 999));
    const collecte = await ScanReport.find({ agencyId, $gte: new Date(startDate), $lte: new Date(endDate) });
    res.status(200).json(collecte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};