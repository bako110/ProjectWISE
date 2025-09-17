import mongoose from 'mongoose';
import ScanReport from '../../models/Agency/ScanReport.js';
import Client from '../../models/clients/Client.js';
import { sendQRCodeEmail } from '../../utils/qrcodemail.js';
import QRCode from 'qrcode';
import User from '../../models/User.js'

/**
 * Contrôleur : scan d’un QR code client (collecte ou problème signalé)
 * URL : GET ou POST /api/collecte/scan?id=<clientId> ou ?clientId=<clientId>
 */

export const scanBarrel = async (req, res) => {
  try {
    // ✅ Récupération de l’ID du client (QR code ou app)
    const clientId = req.query.clientId || req.query.id || req.body.clientId;
    const status = req.body.status || null; // status fourni uniquement en POST

    // ✅ Auth facultative
    const collectorId = req.user?.id || null;
    const agencyId = req.user?.agencyId || null;

    // 🔍 Vérifier l'ID client
    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'ClientId invalide ou manquant.' });
    }

    // 🔍 Récupérer le client
    const client = await Client.findById(clientId).select('firstName lastName phone address');
    if (!client) {
      return res.status(404).json({ error: 'Client introuvable.' });
    }

    // ⚠️ GET → juste afficher infos du client
    if (req.method === 'GET' || !status) {
      return res.status(200).json({
        message: 'Infos du client récupérées avec succès.',
        client: {
          id: client._id,
          name: `${client.firstName} ${client.lastName}`,
          phone: client.phone,
          address: client.address
        }
      });
    }

    // 🔍 POST → valider la collecte
    if (status !== 'collected') {
      return res.status(400).json({ error: 'Le statut doit être "collected".' });
    }

    // 📄 Préparer les données du rapport
    const reportData = {
      clientId,
      collectorId,
      agencyId,
      status: 'collected',
      scannedAt: new Date()
    };

    // 💾 Enregistrer
    const scanReport = await new ScanReport(reportData).save();

    await scanReport.populate([
      { path: 'clientId', select: 'firstName lastName phone' },
      { path: 'collectorId', select: 'firstName lastName' },
      { path: 'agencyId', select: 'agencyName' },
    ]);

    return res.status(201).json({
      message: '✅ Collecte validée avec succès.',
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
    const collectorId = req.user.id;
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