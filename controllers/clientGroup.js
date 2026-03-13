const logger = require('../utils/logger');
const { ClientGroupService } = require('../services/clientGroup');

const clientGroupController = {
    /**
     * Créer un nouveau groupe de clients
     */
    async createClientGroup(req, res) {
        try {
            const group = await ClientGroupService.createClientGroup(req.body);
            res.status(201).json({
                success: true,
                message: 'Groupe de clients créé avec succès',
                data: group
            });
        } catch (error) {
            logger.error({ msg: 'Erreur création groupe', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },

    /**
     * Créer un groupe automatiquement depuis une zone
     */
    async createClientGroupFromZone(req, res) {
        try {
            const { agencyId, zone, groupName, teamId } = req.body;
            if (!agencyId || !zone) {
                return res.status(400).json({ error: 'agencyId et zone sont requis' });
            }
            const group = await ClientGroupService.createClientGroupFromZone(agencyId, zone, groupName, teamId);
            res.status(201).json({
                success: true,
                message: 'Groupe créé automatiquement depuis la zone',
                data: group
            });
        } catch (error) {
            logger.error({ msg: 'Erreur création auto groupe', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },

    /**
     * Obtenir tous les groupes d'une agence
     */
    async getClientGroupsByAgency(req, res) {
        try {
            const { agencyId } = req.params;
            const { status } = req.query;
            const groups = await ClientGroupService.getClientGroupsByAgency(agencyId, status);
            res.status(200).json({
                success: true,
                count: groups.length,
                data: groups
            });
        } catch (error) {
            logger.error({ msg: 'Erreur récupération groupes', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },

    /**
     * Obtenir les détails d'un groupe
     */
    async getClientGroupById(req, res) {
        try {
            const { groupId } = req.params;
            const group = await ClientGroupService.getClientGroupById(groupId);
            res.status(200).json({
                success: true,
                data: group
            });
        } catch (error) {
            logger.error({ msg: 'Erreur récupération groupe', error: error.message });
            res.status(404).json({ 
                success: false,
                error: error.message 
            });
        }
    },

    /**
     * Obtenir tous les groupes d'une équipe
     */
    async getClientGroupsByTeam(req, res) {
        try {
            const { teamId } = req.params;
            const groups = await ClientGroupService.getClientGroupsByTeam(teamId);
            res.status(200).json({
                success: true,
                count: groups.length,
                data: groups
            });
        } catch (error) {
            logger.error({ msg: 'Erreur récupération groupes équipe', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },

    /**
     * Mettre à jour un groupe
     */
    async updateClientGroup(req, res) {
        try {
            const { groupId } = req.params;
            const group = await ClientGroupService.updateClientGroup(groupId, req.body);
            res.status(200).json({
                success: true,
                message: 'Groupe mis à jour avec succès',
                data: group
            });
        } catch (error) {
            logger.error({ msg: 'Erreur mise à jour groupe', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },

    /**
     * Assigner un groupe à une équipe
     */
    async assignGroupToTeam(req, res) {
        try {
            const { groupId } = req.params;
            const { teamId } = req.body;
            if (!teamId) {
                return res.status(400).json({ error: 'teamId est requis' });
            }
            const group = await ClientGroupService.assignGroupToTeam(groupId, teamId);
            res.status(200).json({
                success: true,
                message: 'Groupe assigné à l\'équipe avec succès',
                data: group
            });
        } catch (error) {
            logger.error({ msg: 'Erreur assignation groupe', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },

    /**
     * Retirer un groupe d'une équipe
     */
    async unassignGroupFromTeam(req, res) {
        try {
            const { groupId } = req.params;
            const group = await ClientGroupService.unassignGroupFromTeam(groupId);
            res.status(200).json({
                success: true,
                message: 'Groupe retiré de l\'équipe avec succès',
                data: group
            });
        } catch (error) {
            logger.error({ msg: 'Erreur retrait groupe', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },

    /**
     * Supprimer un groupe
     */
    async deleteClientGroup(req, res) {
        try {
            const { groupId } = req.params;
            await ClientGroupService.deleteClientGroup(groupId);
            res.status(200).json({
                success: true,
                message: 'Groupe supprimé avec succès'
            });
        } catch (error) {
            logger.error({ msg: 'Erreur suppression groupe', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },

    /**
     * Ajouter des clients à un groupe
     */
    async addClientsToGroup(req, res) {
        try {
            const { groupId } = req.params;
            const { clientIds } = req.body;
            if (!clientIds || !Array.isArray(clientIds)) {
                return res.status(400).json({ error: 'clientIds doit être un tableau' });
            }
            const group = await ClientGroupService.addClientsToGroup(groupId, clientIds);
            res.status(200).json({
                success: true,
                message: 'Clients ajoutés au groupe',
                data: group
            });
        } catch (error) {
            logger.error({ msg: 'Erreur ajout clients', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },

    /**
     * Retirer des clients d'un groupe
     */
    async removeClientsFromGroup(req, res) {
        try {
            const { groupId } = req.params;
            const { clientIds } = req.body;
            if (!clientIds || !Array.isArray(clientIds)) {
                return res.status(400).json({ error: 'clientIds doit être un tableau' });
            }
            const group = await ClientGroupService.removeClientsFromGroup(groupId, clientIds);
            res.status(200).json({
                success: true,
                message: 'Clients retirés du groupe',
                data: group
            });
        } catch (error) {
            logger.error({ msg: 'Erreur retrait clients', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },

    /**
     * Obtenir les clients disponibles d'une agence (non assignés à un groupe)
     */
    async getAvailableClientsByAgency(req, res) {
        try {
            const { agencyId } = req.params;
            const clients = await ClientGroupService.getAvailableClientsByAgency(agencyId);
            res.status(200).json({
                success: true,
                count: clients.length,
                data: clients
            });
        } catch (error) {
            logger.error({ msg: 'Erreur récupération clients disponibles', error: error.message });
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
};

module.exports = clientGroupController;
