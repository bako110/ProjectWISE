const QRValidationService = require('../services/qrValidation');

class QRValidationController {

  // Marquer une collecte
  static async collect(req, res) {
    try {
      const { qrData, collectorId } = req.body;
      if (!qrData || !collectorId) {
        return res.status(400).json({ message: 'Missing QR data or collector ID' });
      }

      const result = await QRValidationService.collectSubscription(qrData, collectorId);
      res.status(200).json(result);
    } catch (error) {
      if (['Subscription not found', 'Subscription is not active', 'User not found'].includes(error.message)) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  // Récupérer l'historique des collectes pour un collecteur
  static async history(req, res) {
    try {
      const { collectorId } = req.params;
      const history = await QRValidationService.getCollectorHistory(collectorId);
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = QRValidationController;
