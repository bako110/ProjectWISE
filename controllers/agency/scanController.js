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
    // ✅ Accepte GET (QR code) ou POST (app)
    const clientId = req.query.clientId || req.query.id || req.body.clientId;
    const status = req.body.status || 'collected';
    const comment = req.body.comment;
    const photos = req.body.photos;
    const positionGPS = req.body.positionGPS;

    // ✅ Auth facultative (QR public vs app privée)
    const collectorId = req.user?.id || null;
    const agencyId = req.user?.agencyId || null;

    // 🔍 Valider ID client
    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'ClientId invalide ou manquant.' });
    }

    if (!['collected', 'problem'].includes(status)) {
      return res.status(400).json({ error: 'Le statut doit être "collected" ou "problem".' });
    }

    if (status === 'problem' && (!comment || comment.trim() === '')) {
      return res.status(400).json({ error: 'Un commentaire est requis pour signaler un problème.' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client introuvable.' });
    }

    // 🔍 Valider GPS si fourni
    if (positionGPS) {
      const { lat, lng } = positionGPS;
      if (
        typeof lat !== 'number' || typeof lng !== 'number' ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180
      ) {
        return res.status(400).json({ error: 'Coordonnées GPS invalides.' });
      }
    }

    // 📄 Préparer les données du rapport
    const reportData = {
      clientId,
      scannedAt: new Date(),
      status,
    };

    if (collectorId) reportData.collectorId = collectorId;
    if (agencyId) reportData.agencyId = agencyId;

    if (status === 'problem') {
      reportData.comment = comment?.trim();

      if (Array.isArray(photos)) {
        reportData.photos = photos.filter(p => typeof p === 'string' && p.trim() !== '');
      }

      if (positionGPS) {
        reportData.positionGPS = {
          lat: positionGPS.lat,
          lng: positionGPS.lng,
        };
      }
    }

    // 💾 Enregistrer
    const scanReport = await new ScanReport(reportData).save();

    await scanReport.populate([
      { path: 'clientId', select: 'firstName lastName phone' },
      { path: 'collectorId', select: 'firstName lastName' },
      { path: 'agencyId', select: 'agencyName' },
    ]);

    return res.status(201).json({
      message: status === 'collected'
        ? '✅ Collecte validée avec succès.'
        : '⚠️ Problème signalé avec succès.',
      // report: {
      //   id: scanReport._id,
      //   client: scanReport.clientId,
      //   collector: scanReport.collectorId || null,
      //   agency: scanReport.agencyId || null,
      //   status: scanReport.status,
      //   scannedAt: scanReport.scannedAt,
      //   ...(status === 'problem' && {
      //     comment: scanReport.comment,
      //     photos: scanReport.photos,
      //     positionGPS: scanReport.positionGPS,
      //   }),
      // }
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