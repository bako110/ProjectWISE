const CollecteService = require('../services/qrValidation');

class CollecteController {

  static async scanCollecte(req, res) {
    try {
      const { code, collectorId } = req.body;
      if (!code || !collectorId) {
        return res.status(400).json({ message: 'Code and collectorId are required' });
      }

      const collecte = await CollecteService.markCollected({ code, collectorId });
      return res.status(200).json({ message: 'Collecte marked as collected', collecte });

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getCollectesByAgency(req, res) {
    try {
      const { agencyId } = req.params;
      const collectes = await CollecteService.getCollectesByAgency(agencyId);
      return res.status(200).json(collectes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getCollectesByCollector(req, res) {
    try {
      const { collectorId } = req.params;
      const collectes = await CollecteService.getCollectesByCollector(collectorId);
      return res.status(200).json(collectes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getAllCollectes(req, res) {
    try {
      const collectes = await CollecteService.getAllCollectes();
      return res.status(200).json(collectes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = CollecteController;
