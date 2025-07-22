import mongoose from 'mongoose';
import ScanReport from '../../models/Agency/ScanReport.js';
import Client from '../../models/clients/Client.js';

/**
 * Valider un scan de barrique via QR code
 */

// 👉 Nouveau : accepte GET auto + fallback POST
export const scanBarrel = async (req, res) => {
  try {
    // ✅ Priorité au GET query param (scan auto), sinon body
    const clientId = req.query.clientId || req.body.clientId;
    const status = req.body.status || 'collected';
    const comment = req.body.comment;
    const photos = req.body.photos;
    const positionGPS = req.body.positionGPS;

    const collectorId = req.user?.id;         // Authentifié (token)
    const agencyId = req.user?.agencyId;

    // 🔎 Vérification de base
    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'ClientId invalide ou manquant.' });
    }

    if (!['collected', 'problem'].includes(status)) {
      return res.status(400).json({ error: 'Status doit être "collected" ou "problem".' });
    }

    if (status === 'problem' && (!comment || comment.trim() === '')) {
      return res.status(400).json({ error: 'Commentaire obligatoire si status = problem.' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client introuvable.' });
    }

    if (positionGPS) {
      const { lat, lng } = positionGPS;
      if (
        typeof lat !== 'number' ||
        typeof lng !== 'number' ||
        lat < -90 || lat > 90 ||
        lng < -180 || lng > 180
      ) {
        return res.status(400).json({ error: 'Coordonnées GPS invalides.' });
      }
    }

    // 📄 Préparation des données de rapport
    const reportData = {
      clientId,
      collectorId,
      agencyId,
      status,
      scannedAt: new Date()
    };

    if (status === 'problem') {
      reportData.comment = comment?.trim();
      if (Array.isArray(photos)) {
        reportData.photos = photos.filter(p => p && p.trim() !== '');
      }
      if (positionGPS) {
        reportData.positionGPS = { lat: positionGPS.lat, lng: positionGPS.lng };
      }
    }

    // ✅ Enregistrement
    const scanReport = await new ScanReport(reportData).save();

    await scanReport.populate([
      { path: 'clientId', select: 'firstName lastName phone' },
      { path: 'collectorId', select: 'firstName lastName' },
      { path: 'agencyId', select: 'agencyName' }
    ]);

    return res.status(201).json({
      message: status === 'collected'
        ? 'Collecte validée avec succès'
        : 'Problème signalé avec succès',
      report: {
        id: scanReport._id,
        client: scanReport.clientId,
        collector: scanReport.collectorId,
        agency: scanReport.agencyId,
        status: scanReport.status,
        scannedAt: scanReport.scannedAt,
        ...(status === 'problem' && {
          comment: scanReport.comment,
          photos: scanReport.photos,
          positionGPS: scanReport.positionGPS
        })
      }
    });

  } catch (error) {
    console.error('Erreur lors du scan:', error);
    return res.status(500).json({ error: 'Erreur serveur interne.' });
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

/**
 * Détails d’un scan spécifique
 */
export const getScanDetails = async (req, res) => {
  try {
    const { scanId } = req.params;
    const collectorId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(scanId)) {
      return res.status(400).json({ error: 'ID de scan invalide.' });
    }

    const scan = await ScanReport.findOne({ _id: scanId, collectorId })
      .populate('clientId', 'firstName lastName phone address')
      .populate('collectorId', 'firstName lastName')
      .populate('agencyId', 'agencyName address');

    if (!scan) {
      return res.status(404).json({ error: 'Scan introuvable' });
    }

    return res.json({ scan });

  } catch (error) {
    console.error('Erreur détails scan:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

/**
 * Statistiques de collecte par client pour une agence
 */
export const getCollecteStatsByClient = async (req, res) => {
  try {
    const { agencyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(400).json({ message: 'ID agence invalide.' });
    }

    const stats = await ScanReport.aggregate([
      { $match: { agencyId: new mongoose.Types.ObjectId(agencyId) } },
      { $group: { _id: '$clientId', nombreDeCollectes: { $sum: 1 } } },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' },
      {
        $project: {
          _id: 0,
          clientId: '$_id',
          clientName: { $concat: ['$client.firstName', ' ', '$client.lastName'] },
          nombreDeCollectes: 1
        }
      },
      { $sort: { nombreDeCollectes: -1 } }
    ]);

    return res.status(200).json(stats);

  } catch (error) {
    console.error('Erreur stats collecte:', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
