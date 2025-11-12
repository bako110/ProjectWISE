const {collecteService} = require('../services/collecte.service.js');

exports.collecteController = {
    async UserCollecteHistory(req, res) {
        try {
            const { userId } = req.params;
            const collectes = await collecteService.UserCollecteHistory(userId);
            res.status(200).json(collectes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async userCollecteReporting (req, res) {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                return res.status(400).json({ message: 'Collecte ID is required' });
            }
            const collecte = await collecteService.UserReportingHistory(userId);
            res.status(200).json(collecte);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }

    },

    async UserScheduledCollectes(req, res) {
        try {
            const { userId } = req.params;
            const collectes = await collecteService.UserScheduledCollectes(userId);
            res.status(200).json(collectes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async AgencyCollectes(req, res) {
        try {
            const { agencyId } = req.params;
            const collectes = await collecteService.AgencyCollectes(agencyId);
            res.status(200).json(collectes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async AgencyCompletedCollectes(req, res) {
        try {
            const { agencyId } = req.params;
            const collectes = await collecteService.AgencyCompletedCollectes(agencyId);
            res.status(200).json(collectes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async AgencyReportingCollectes(req, res) {
        try {
            const { agencyId } = req.params;
            const collectes = await collecteService.AgencyReportingCollectes(agencyId);
            res.status(200).json(collectes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async CollectorCollectes(req, res) {
        try {
            const { collectorId } = req.params;
            const collectes = await collecteService.CollectorCollectes(collectorId);
            res.status(200).json(collectes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async CollectorCompletedCollectes(req, res) {
        try {
            const { collectorId } = req.params;
            const collectes = await collecteService.CollectorCompletedCollectes(collectorId);
            res.status(200).json(collectes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async CollectorReportingCollectes(req, res) {
        try {
            const { collectorId } = req.params;
            const collectes = await collecteService.CollectorReportingCollectes(collectorId);
            res.status(200).json(collectes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};