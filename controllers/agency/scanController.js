import ScanReport from '../../models/Agency/ScanReport.js';
import Client from '../../models/clients/Client.js';
import mongoose from 'mongoose';

/**
 * Valider un scan de barrique via QR code
 * Deux cas possibles :
 * 1. Collecte normale : status = 'collected' (juste clientId requis)
 * 2. Problème : status = 'problem' (clientId + comment obligatoire + optionnels: photos, GPS)
 */
export const scanBarrel = async (req, res) => {
  try {
    const { clientId, status = 'collected', comment, photos, positionGPS } = req.body;
    const collectorId = req.user.id; // récupéré du middleware d'auth
    const agencyId = req.user.agencyId; // récupéré du middleware d'auth

    // Validation des données requises
    if (!clientId) {
      return res.status(400).json({
        error: 'ClientId est requis'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        error: 'Format de clientId invalide'
      });
    }

    // Validation du statut
    if (!['collected', 'problem'].includes(status)) {
      return res.status(400).json({
        error: 'Status doit être "collected" ou "problem"'
      });
    }

    // Si problème, commentaire obligatoire
    if (status === 'problem' && (!comment || comment.trim() === '')) {
      return res.status(400).json({
        error: 'Un commentaire est obligatoire quand le statut est "problem"'
      });
    }

    // Vérifier que le client existe
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        error: 'Client introuvable'
      });
    }

    // Validation des coordonnées GPS si présentes
    if (positionGPS) {
      const { lat, lng } = positionGPS;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({
          error: 'Les coordonnées GPS doivent être des nombres'
        });
      }
      if (lat < -90 || lat > 90) {
        return res.status(400).json({
          error: 'La latitude doit être entre -90 et 90'
        });
      }
      if (lng < -180 || lng > 180) {
        return res.status(400).json({
          error: 'La longitude doit être entre -180 et 180'
        });
      }
    }

    // Préparer les données du rapport
    const reportData = {
      clientId,
      collectorId,
      agencyId,
      status,
      scannedAt: new Date()
    };

    // Ajouter les champs optionnels seulement s'ils sont fournis
    if (status === 'problem') {
      reportData.comment = comment.trim();
      
      if (photos && Array.isArray(photos) && photos.length > 0) {
        reportData.photos = photos.filter(photo => photo && photo.trim() !== '');
      }
      
      if (positionGPS) {
        reportData.positionGPS = {
          lat: positionGPS.lat,
          lng: positionGPS.lng
        };
      }
    }

    // Créer le rapport de scan
    const scanReport = new ScanReport(reportData);
    await scanReport.save();

    // Peupler les références pour la réponse
    await scanReport.populate([
      { path: 'clientId', select: 'name email phone' },
      { path: 'collectorId', select: 'firstName lastName' },
      { path: 'agencyId', select: 'name' }
    ]);

    // Réponse adaptée selon le statut
    const message = status === 'collected' 
      ? 'Collecte validée avec succès'
      : 'Problème signalé avec succès';

    res.status(201).json({
      message,
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
    
    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Erreur de validation',
        details: validationErrors
      });
    }

    // Erreur de référence (client inexistant par exemple)
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Format de données invalide'
      });
    }

    res.status(500).json({
      error: 'Erreur serveur interne'
    });
  }
};

/**
 * Récupérer l'historique des scans d'un collector
 */
export const getScanHistory = async (req, res) => {
  try {
    const collectorId = req.user.id;
    const { page = 1, limit = 20, status, clientId } = req.query;

    const query = { collectorId };
    
    // Filtres optionnels
    if (status && ['collected', 'problem'].includes(status)) {
      query.status = status;
    }
    
    if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
      query.clientId = clientId;
    }

    const skip = (page - 1) * limit;
    
    const [scans, total] = await Promise.all([
      ScanReport.find(query)
        .populate('clientId', 'name email phone')
        .populate('collectorId', 'firstName lastName')
        .populate('agencyId', 'name')
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
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      error: 'Erreur serveur interne'
    });
  }
};

/**
 * Récupérer les détails d'un scan spécifique
 */
export const getScanDetails = async (req, res) => {
  try {
    const { scanId } = req.params;
    const collectorId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(scanId)) {
      return res.status(400).json({
        error: 'Format de scanId invalide'
      });
    }

    const scan = await ScanReport.findOne({
      _id: scanId,
      collectorId // S'assurer que le collector peut seulement voir ses propres scans
    })
      .populate('clientId', 'name email phone address')
      .populate('collectorId', 'firstName lastName')
      .populate('agencyId', 'name address');

    if (!scan) {
      return res.status(404).json({
        error: 'Scan introuvable'
      });
    }

    res.json({ scan });

  } catch (error) {
    console.error('Erreur lors de la récupération du scan:', error);
    res.status(500).json({
      error: 'Erreur serveur interne'
    });
  }
};


export const getCollecteStatsByClient = async (req, res) => {
  try {
    const { agencyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(400).json({ message: 'ID agence invalide.' });
    }

    const stats = await ScanReport.aggregate([
      {
        $match: {
          agencyId: new mongoose.Types.ObjectId(agencyId),
        }
      },
      {
        $group: {
          _id: '$clientId',
          nombreDeCollectes: { $sum: 1 },
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $unwind: '$client'
      },
      {
        $project: {
          _id: 0,
          clientId: '$_id',
          clientName: '$client.name',
          nombreDeCollectes: 1
        }
      },
      {
        $sort: { nombreDeCollectes: -1 }
      }
    ]);

    return res.status(200).json(stats);

  } catch (error) {
    console.error('Erreur récupération stats:', error);
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};