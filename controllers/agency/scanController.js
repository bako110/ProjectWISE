import ScanReport from '../../models/agency/ScanReport.js';
import Client from '../../models/clients/Client.js';
import Employee from '../../models/Agency/Employee.js';

export const scanBarrel = async (req, res) => {
  try {
    const {
      clientId,
      status = 'collected',
      comment,
      photos,
      positionGPS
    } = req.body;

    const collectorId = req.user._id;

    // Vérification clientId obligatoire
    if (!clientId) {
      return res.status(400).json({ error: 'clientId requis' });
    }

    // Vérifier que le client existe
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ error: 'Client non trouvé' });

    // Vérifier que le collecteur existe
    const collector = await Employee.findById(collectorId);
    if (!collector) return res.status(404).json({ error: 'Collecteur non trouvé' });

    const agencyId = collector.agencyId;

    // En cas de problème, un commentaire est obligatoire
    if (status === 'problem' && (!comment || comment.trim() === '')) {
      return res.status(400).json({ error: 'Un commentaire est requis en cas de problème' });
    }

    // Créer le rapport de scan
    const report = await ScanReport.create({
      clientId,
      collectorId,
      agencyId,
      status,
      comment: comment || '',
      photos: Array.isArray(photos) ? photos : [],
      positionGPS: positionGPS && typeof positionGPS === 'object' ? positionGPS : null,
    });

    res.status(201).json({
      message: status === 'collected'
        ? "Collecte validée avec succès"
        : "Problème signalé avec succès",
      report,
    });
  } catch (error) {
    console.error("Erreur lors du scan :", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
