const { collecteService } = require('../services/collecte.service.js');

exports.collecteController = {

    /** 🔹 HISTORIQUES UTILISATEUR */
    async UserCollecteHistory(req, res) {
        try {
            const { userId } = req.params;
            const collectes = await collecteService.UserCollecteHistory(userId);
            res.status(200).json(collectes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async userCollecteReporting(req, res) {
        try {
            const { userId } = req.params;
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

    /** 🔹 AGENCE */
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

    /** 🔹 COLLECTEUR */
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

    /** 🔥 NOUVEAU : SIGNALER UNE COLLECTE */
    async reportCollecte(req, res) {
        try {
            const { collecteId } = req.params;
            const { comment, photos } = req.body;

            const updated = await collecteService.reportCollecte(collecteId, {
                comment,
                photos
            });

            res.status(200).json({
                success: true,
                message: "Collecte signalée et statut mis à 'Reported'",
                data: updated
            });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
