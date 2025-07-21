import scanBarrel from '../../controllers/agency/scanBarrel.js';
import Client from '../../models/Client.js';
import Employee from '../../models/Employee.js';

export const scanBarrel = async (req, res) => {
  try {
    const {
      clientId,
      status = 'collected',  // défaut à "collected"
      comment,
      photos,
      positionGPS
    } = req.body;

    const collectorId = req.user._id;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId requis' });
    }

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ error: 'Client non trouvé' });

    const collector = await Employee.findById(collectorId);
    if (!collector) return res.status(404).json({ error: 'Collecteur non trouvé' });

    const agencyId = collector.agencyId;

    // Si statut "problem", on vérifie qu'un commentaire est fourni (optionnel selon besoin)
    if (status === 'problem' && (!comment || comment.trim() === '')) {
      return res.status(400).json({ error: 'Un commentaire est requis en cas de problème' });
    }

    const report = await ScanReport.create({
      clientId,
      collectorId,
      agencyId,
      status,
      comment: comment || '',
      photos: photos || [],
      positionGPS: positionGPS || null,
    });

    res.status(201).json({
      message: status === 'collected'
        ? "Collecte validée avec succès"
        : "Problème signalé avec succès",
      report,
    });
  } catch (error) {
    console.error("Erreur scan :", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
