const logger = require('../utils/logger');
const TeamService = require('../services/team');

class TeamController {
    async createTeam(req, res) {
        try {
            const team = await TeamService.createTeam(req.body);
            res.status(201).json({
                success: true,
                message: 'Équipe créée avec succès',
                data: team
            });
        } catch (error) {
            logger.error({ msg: 'Erreur création équipe', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    // Ajouter des collecteurs à une équipe
    async addCollectorsToTeam(req, res) {
        try {
            const { teamId } = req.params;
            const { collectorIds } = req.body;
            if (!Array.isArray(collectorIds) || collectorIds.length === 0) {
                return res.status(400).json({ success: false, error: 'collectorIds doit être un tableau non vide' });
            }
            const team = await TeamService.addCollectorsToTeam(teamId, collectorIds);
            res.status(200).json({
                success: true,
                message: 'Collecteurs ajoutés à l\'équipe',
                data: team
            });
        } catch (error) {
            logger.error({ msg: 'Erreur ajout collecteurs', error: error.message });
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Retirer des collecteurs d'une équipe
    async removeCollectorsFromTeam(req, res) {
        try {
            const { teamId } = req.params;
            const { collectorIds } = req.body;
            if (!Array.isArray(collectorIds) || collectorIds.length === 0) {
                return res.status(400).json({ success: false, error: 'collectorIds doit être un tableau non vide' });
            }
            const team = await TeamService.removeCollectorsFromTeam(teamId, collectorIds);
            res.status(200).json({
                success: true,
                message: 'Collecteurs retirés de l\'équipe',
                data: team
            });
        } catch (error) {
            logger.error({ msg: 'Erreur retrait collecteurs', error: error.message });
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getTeamsByAgency(req, res) {
        try {
            const { agencyId } = req.params;
            const { status } = req.query;
            const teams = await TeamService.getTeamsByAgency(agencyId, status);
            res.status(200).json({
                success: true,
                count: teams.length,
                data: teams
            });
        } catch (error) {
            logger.error({ msg: 'Erreur récupération équipes', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    async getTeamById(req, res) {
        try {
            const { teamId } = req.params;
            const team = await TeamService.getTeamById(teamId);
            res.status(200).json({
                success: true,
                data: team
            });
        } catch (error) {
            logger.error({ msg: 'Erreur récupération équipe', error: error.message });
            res.status(404).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    async updateTeam(req, res) {
        try {
            const { teamId } = req.params;
            const team = await TeamService.updateTeam(teamId, req.body);
            res.status(200).json({
                success: true,
                message: 'Équipe mise à jour avec succès',
                data: team
            });
        } catch (error) {
            logger.error({ msg: 'Erreur mise à jour équipe', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    async deleteTeam(req, res) {
        try {
            const { teamId } = req.params;
            await TeamService.deleteTeam(teamId);
            res.status(200).json({
                success: true,
                message: 'Équipe supprimée avec succès'
            });
        } catch (error) {
            logger.error({ msg: 'Erreur suppression équipe', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    async getTeamStats(req, res) {
        try {
            const { teamId } = req.params;
            const stats = await TeamService.getTeamStats(teamId);
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            logger.error({ msg: 'Erreur statistiques équipe', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
}

module.exports = new TeamController();
