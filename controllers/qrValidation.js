const CollecteService = require('../services/qrValidation');

class CollecteController {

  static async updateStatus(req, res) {
    try {
      const { code, id, name } = req.body;
      if (!code || !id || !name) {
        return res.status(400).json({ message: 'code, id and name are required' });
      }

      const collecte = await CollecteService.updateCollecteStatus({ code, id, name });
      if (!collecte) {
        return res.status(404).json({ message: 'Collecte not found' });
      }
      
      return res.status(200).json({ message: 'Collecte status updated successfully' });

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
