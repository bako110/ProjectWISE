const DechetService = require('../services/dechet.service.js');

class DechetController {
    static async createDechet(req, res) {
        try {
            const dechetData = req.body;
            if (!dechetData.name) {
                return res.status(400).json({ message: 'Le nom du déchet est requis.' });
            }
            const newDechet = await DechetService.createDechet(dechetData);
            res.status(201).json(newDechet);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getDechetById(req, res) {
        try {
            const dechetId = req.params.id;
            const dechet = await DechetService.getDechetById(dechetId);
            if (!dechet) {
                return res.status(404).json({ message: 'Déchet non trouvé.' });
            }
            res.status(200).json(dechet);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getAllDechets(req, res) {
        try {
            const dechets = await DechetService.getAllDechets();
            res.status(200).json(dechets);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async updateDechet(req, res) {
        try {
            const dechetId = req.params.id;
            const updateData = req.body;
            const updatedDechet = await DechetService.updateDechet(dechetId, updateData);
            if (!updatedDechet) {
                return res.status(404).json({ message: 'Déchet non trouvé.' });
            }
            res.status(200).json(updatedDechet);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async deleteDechet(req, res) {
        try {
            const dechetId = req.params.id;
            const deletedDechet = await DechetService.deleteDechet(dechetId);
            if (!deletedDechet) {
                return res.status(404).json({ message: 'Déchet non trouvé.' });
            }
            res.status(200).json({ message: 'Déchet supprimé avec successe.' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = DechetController;