const Team = require('../models/Team');
const User = require('../models/User');
const Agency = require('../models/agency');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

const TeamService = {
    /**
     * Créer une nouvelle équipe
     */
    async createTeam(teamData) {
        try {
            logger.info({ msg: "Création d'une nouvelle équipe", teamData });

            // Vérifier que l'agence existe
            const agency = await Agency.findById(teamData.agencyId);
            if (!agency) {
                throw new Error('Agence non trouvée');
            }

            // Vérifier que le responsable existe
            if (teamData.leaderId) {
                const leader = await User.findById(teamData.leaderId);
                if (!leader) {
                    throw new Error('Responsable non trouvé');
                }
            }

            // Vérifier que les collecteurs existent
            if (teamData.collectors && teamData.collectors.length > 0) {
                for (const collectorId of teamData.collectors) {
                    const collector = await User.findById(collectorId);
                    if (!collector) {
                        throw new Error(`Collecteur non trouvé: ${collectorId}`);
                    }
                    if (collector.role !== 'collector') {
                        throw new Error(`L'utilisateur ${collectorId} n'est pas un collecteur`);
                    }
                }
            }

            // Créer l'équipe
            const team = new Team(teamData);
            await team.save();

            logger.info({ msg: 'Équipe créée avec succès', teamId: team._id });
            
            return team;
        } catch (error) {
            logger.error({ msg: "Erreur lors de la création de l'équipe", error: error.message });
            throw error;
        }
    },

    /**
     * Obtenir une équipe par son ID
     */
    async getTeamById(teamId) {
        try {
            const team = await Team.findById(teamId)
                .populate('leaderId', 'firstName lastName email phone')
                .populate('collectors', 'firstName lastName email phone')
                .populate('agencyId', 'name');

            if (!team) {
                throw new Error('Équipe non trouvée');
            }

            return team;
        } catch (error) {
            logger.error({ msg: 'Erreur lors de la récupération de l\'équipe', error: error.message });
            throw error;
        }
    },

    /**
     * Obtenir toutes les équipes d'une agence
     */
    async getTeamsByAgency(agencyId, status = null) {
        try {
            const query = { agencyId: new mongoose.Types.ObjectId(agencyId) };
            if (status) {
                query.status = status;
            }

            const teams = await Team.find(query)
                .populate('leaderId', 'firstName lastName email phone')
                .populate('collectors', 'firstName lastName email phone')
                .sort({ createdAt: -1 });

            return teams;
        } catch (error) {
            logger.error({ msg: 'Erreur lors de la récupération des équipes', error: error.message });
            throw error;
        }
    },

    /**
     * Mettre à jour une équipe
     */
    async updateTeam(teamId, updateData) {
        try {
            logger.info({ msg: 'Mise à jour d\'une équipe', teamId, updateData });

            const team = await Team.findById(teamId);
            if (!team) {
                throw new Error('Équipe non trouvée');
            }

            // Vérifier le responsable si modifié
            if (updateData.leaderId) {
                const leader = await User.findById(updateData.leaderId);
                if (!leader) {
                    throw new Error('Responsable non trouvé');
                }
            }

            // Vérifier les collecteurs si modifiés
            if (updateData.collectors) {
                for (const collectorId of updateData.collectors) {
                    const collector = await User.findById(collectorId);
                    if (!collector) {
                        throw new Error(`Collecteur non trouvé: ${collectorId}`);
                    }
                    if (collector.role !== 'collector') {
                        throw new Error(`Collecteur invalide: ${collectorId} - Le rôle doit être 'collector'`);
                    }
                }
            }

            Object.assign(team, updateData);
            await team.save();

            logger.info({ msg: 'Équipe mise à jour avec succès', teamId });
            
            return team;
        } catch (error) {
            logger.error({ msg: 'Erreur lors de la mise à jour de l\'équipe', error: error.message });
            throw error;
        }
    },

    /**
     * Supprimer une équipe
     */
    async deleteTeam(teamId) {
        try {
            // Vérifier si l'équipe a des groupes assignés
            const ClientGroup = require('../models/ClientGroup');
            const assignedGroups = await ClientGroup.findOne({ teamId, status: 'active' });
            
            if (assignedGroups) {
                throw new Error('Impossible de supprimer une équipe qui a des groupes de clients assignés');
            }

            const team = await Team.findByIdAndDelete(teamId);
            if (!team) {
                throw new Error('Équipe non trouvée');
            }

            logger.info({ msg: 'Équipe supprimée avec succès', teamId });
            return team;
        } catch (error) {
            logger.error({ msg: 'Erreur lors de la suppression de l\'équipe', error: error.message });
            throw error;
        }
    },

    /**
     * Obtenir les statistiques d'une équipe
     */
    async getTeamStats(teamId) {
        try {
            const ClientGroup = require('../models/ClientGroup');
            const Planning = require('../models/planning');
            const Collecte = require('../models/Collecte');

            const team = await Team.findById(teamId);
            if (!team) {
                throw new Error('Équipe non trouvée');
            }

            // Nombre de groupes de clients assignés
            const clientGroups = await ClientGroup.countDocuments({ 
                teamId, 
                status: 'active' 
            });

            // Nombre total de clients
            const totalClientsResult = await ClientGroup.aggregate([
                { $match: { teamId: new mongoose.Types.ObjectId(teamId), status: 'active' } },
                { $unwind: '$clients' },
                { $group: { _id: null, count: { $sum: 1 } } }
            ]);

            // Plannings actifs
            const activePlannings = await Planning.countDocuments({ 
                teamId, 
                status: true,
                date: { $gte: new Date() }
            });

            // Collectes ce mois
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const collectesThisMonth = await Collecte.countDocuments({
                collectorId: { $in: team.collectors },
                createdAt: { $gte: startOfMonth }
            });

            const stats = {
                teamId: team._id,
                teamName: team.name,
                collectorsCount: team.collectors.length,
                clientGroups,
                totalClients: totalClientsResult.length > 0 ? totalClientsResult[0].count : 0,
                activePlannings,
                collectesThisMonth
            };

            logger.info({ msg: 'Statistiques de l\'équipe récupérées', teamId, stats });
            
            return stats;
        } catch (error) {
            logger.error({ msg: 'Erreur lors de la récupération des statistiques', error: error.message });
            throw error;
        }
    },

    /**
     * Ajouter des collecteurs à une équipe
     */
    async addCollectorsToTeam(teamId, collectorIds) {
        try {
            const team = await Team.findById(teamId);
            if (!team) {
                throw new Error('Équipe non trouvée');
            }

            // Vérifier les nouveaux collecteurs
            for (const collectorId of collectorIds) {
                const collector = await User.findById(collectorId);
                if (!collector) {
                    throw new Error(`Collecteur non trouvé: ${collectorId}`);
                }
                if (collector.role !== 'collector') {
                    throw new Error(`L'utilisateur ${collectorId} n'est pas un collecteur`);
                }
                
                // Éviter les doublons
                if (!team.collectors.includes(collectorId)) {
                    team.collectors.push(collectorId);
                }
            }

            await team.save();
            logger.info({ msg: 'Collecteurs ajoutés à l\'équipe', teamId, count: collectorIds.length });
            
            return team;
        } catch (error) {
            logger.error({ msg: 'Erreur lors de l\'ajout des collecteurs', error: error.message });
            throw error;
        }
    },

    /**
     * Retirer des collecteurs d'une équipe
     */
    async removeCollectorsFromTeam(teamId, collectorIds) {
        try {
            const team = await Team.findById(teamId);
            if (!team) {
                throw new Error('Équipe non trouvée');
            }

            team.collectors = team.collectors.filter(
                collectorId => !collectorIds.includes(collectorId.toString())
            );

            await team.save();
            logger.info({ msg: 'Collecteurs retirés de l\'équipe', teamId, count: collectorIds.length });
            
            return team;
        } catch (error) {
            logger.error({ msg: 'Erreur lors du retrait des collecteurs', error: error.message });
            throw error;
        }
    },

    /**
     * Changer le responsable d'une équipe
     */
    async changeTeamLeader(teamId, newLeaderId) {
        try {
            const team = await Team.findById(teamId);
            if (!team) {
                throw new Error('Équipe non trouvée');
            }

            const newLeader = await User.findById(newLeaderId);
            if (!newLeader) {
                throw new Error('Nouveau responsable non trouvé');
            }

            team.leaderId = newLeaderId;
            await team.save();

            logger.info({ msg: 'Responsable de l\'équipe changé', teamId, newLeaderId });
            
            return team;
        } catch (error) {
            logger.error({ msg: 'Erreur lors du changement de responsable', error: error.message });
            throw error;
        }
    }
};

module.exports = TeamService;