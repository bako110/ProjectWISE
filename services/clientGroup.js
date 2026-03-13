const ClientGroup = require('../models/ClientGroup');
const User = require('../models/User');
const Team = require('../models/Team');
const Agency = require('../models/agency');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

exports.ClientGroupService = {
    // Créer un groupe de clients
    async createClientGroup(groupData) {
        try {
            logger.info({ msg: "Création d'un nouveau groupe de clients", groupData });

            // Vérifier que l'agence existe
            const agency = await Agency.findById(groupData.agencyId);
            if (!agency) {
                throw new Error('Agence non trouvée');
            }

            // Vérifier que tous les clients existent
            for (const clientId of groupData.clients) {
                const client = await User.findById(clientId);
                if (!client) {
                    throw new Error(`Client non trouvé: ${clientId}`);
                }
                if (client.role !== 'client') {
                    throw new Error(`L'utilisateur ${clientId} n'est pas un client`);
                }
                if (client.agencyId.toString() !== groupData.agencyId) {
                    throw new Error(`Le client ${clientId} n'appartient pas à cette agence`);
                }
            }

            // Vérifier que l'équipe existe si elle est fournie
            if (groupData.teamId) {
                const team = await Team.findById(groupData.teamId);
                if (!team) {
                    throw new Error('Équipe non trouvée');
                }
            }

            // Créer le groupe
            const clientGroup = new ClientGroup(groupData);
            await clientGroup.save();

            logger.info({ msg: 'Groupe de clients créé avec succès', groupId: clientGroup._id });
            return clientGroup;
        } catch (error) {
            logger.error({ msg: 'Erreur lors de la création du groupe de clients', error: error.message });
            throw error;
        }
    },

    /**
     * Créer un groupe automatiquement à partir d'une zone
     */
    async createClientGroupFromZone(agencyId, zone, groupName, teamId = null) {
        try {
            logger.info({ msg: "Création auto d'un groupe depuis une zone", agencyId, zone });

        // Récupérer tous les clients de cette zone
            const clients = await User.find({
                agencyId: new mongoose.Types.ObjectId(agencyId),
                role: 'client',
                'address.neighborhood': zone,
                status: 'active'
            }).select('_id');

            if (clients.length === 0) {
                throw new Error(`Aucun client trouvé dans la zone ${zone}`);
            }

            const clientIds = clients.map(c => c._id);

            const groupData = {
                name: groupName || `Groupe - ${zone}`,
                agencyId,
                clients: clientIds,
                zone,
                teamId
            };

            return await this.createClientGroup(groupData);
        } catch (error) {
            logger.error({ msg: 'Erreur création groupe auto', error: error.message });
            throw error;
        }
    },

    // Obtenir tous les groupes d'une agence
    async getClientGroupsByAgency(agencyId, status = null) {
        try {
            const query = { agencyId: new mongoose.Types.ObjectId(agencyId) };
            if (status) {
                query.status = status;
            }

            const groups = await ClientGroup.find(query)
                .populate('clients', 'firstName lastName email phone address')
                .populate('teamId', 'name leaderId')
                .sort({ createdAt: -1 });

            return groups;
        } catch (error) {
            logger.error({ msg: 'Erreur récupération groupes', error: error.message });
            throw error;
        }
    },

    // Obtenir les détails d'un groupe
    async getClientGroupById(groupId) {
        try {
            const group = await ClientGroup.findById(groupId)
                .populate('clients', 'firstName lastName email phone address')
                .populate('teamId', 'name leaderId collectors')
                .populate('agencyId', 'name');

            if (!group) {
                throw new Error('Groupe non trouvé');
            }

            return group;
        } catch (error) {
            logger.error({ msg: 'Erreur récupération groupe', error: error.message });
            throw error;
        }
    },

    // Obtenir tous les groupes assignés à une équipe
    async getClientGroupsByTeam(teamId) {
        try {
            const groups = await ClientGroup.find({
                teamId: new mongoose.Types.ObjectId(teamId),
                status: 'active'
            })
                .populate('clients', 'firstName lastName email phone address')
                .sort({ createdAt: -1 });

            return groups;
        } catch (error) {
            logger.error({ msg: "Erreur récupération groupes de l'équipe", error: error.message });
            throw error;
        }
    },

    // Mettre à jour un groupe
    async updateClientGroup(groupId, updateData) {
        try {
            logger.info({ msg: 'Mise à jour groupe', groupId, updateData });

            const group = await ClientGroup.findById(groupId);
            if (!group) {
                throw new Error('Groupe non trouvé');
            }

            // Vérifier les clients si modifiés
            if (updateData.clients) {
                for (const clientId of updateData.clients) {
                    const client = await User.findById(clientId);
                    if (!client || client.role !== 'client') {
                        throw new Error(`Client invalide: ${clientId}`);
                    }
                }
            }

            // Vérifier l'équipe si modifiée
            if (updateData.teamId) {
                const team = await Team.findById(updateData.teamId);
                if (!team) {
                    throw new Error('Équipe non trouvée');
                }
            }

            Object.assign(group, updateData);
            await group.save();

            logger.info({ msg: 'Groupe mis à jour avec succès', groupId });
            return group;
        } catch (error) {
            logger.error({ msg: 'Erreur mise à jour groupe', error: error.message });
            throw error;
        }
    },

    // Assigner un groupe à une équipe
    async assignGroupToTeam(groupId, teamId) {
        try {
            const group = await ClientGroup.findById(groupId);
            if (!group) {
                throw new Error('Groupe non trouvé');
            }

            const team = await Team.findById(teamId);
            if (!team) {
                throw new Error('Équipe non trouvée');
            }

            group.teamId = teamId;
            await group.save();

            logger.info({ msg: "Groupe assigné à l'équipe", groupId, teamId });
            return group;
        } catch (error) {
            logger.error({ msg: 'Erreur assignation groupe', error: error.message });
            throw error;
        }
    },

    // Retirer un groupe d'une équipe
    async unassignGroupFromTeam(groupId) {
        try {
            const group = await ClientGroup.findById(groupId);
            if (!group) {
                throw new Error('Groupe non trouvé');
            }

            group.teamId = null;
            await group.save();

            logger.info({ msg: "Groupe retiré de l'équipe", groupId });
            return group;
        } catch (error) {
            logger.error({ msg: 'Erreur retrait groupe', error: error.message });
            throw error;
        }
    },

    // Supprimer un groupe
    async deleteClientGroup(groupId) {
        try {
            const group = await ClientGroup.findByIdAndDelete(groupId);
            if (!group) {
                throw new Error('Groupe non trouvé');
            }

            logger.info({ msg: 'Groupe supprimé avec succès', groupId });
            return group;
        } catch (error) {
            logger.error({ msg: 'Erreur suppression groupe', error: error.message });
            throw error;
        }
    },

    // Ajouter des clients à un groupe
    async addClientsToGroup(groupId, clientIds) {
        try {
            const group = await ClientGroup.findById(groupId);
            if (!group) {
                throw new Error('Groupe non trouvé');
            }

            // Vérifier les nouveaux clients
            for (const clientId of clientIds) {
                const client = await User.findById(clientId);
                if (!client || client.role !== 'client') {
                    throw new Error(`Client invalide: ${clientId}`);
                }
                // Éviter les doublons
                if (!group.clients.includes(clientId)) {
                    group.clients.push(clientId);
                }
            }

            await group.save();
            logger.info({ msg: 'Clients ajoutés au groupe', groupId, count: clientIds.length });
            return group;
        } catch (error) {
            logger.error({ msg: 'Erreur ajout clients', error: error.message });
            throw error;
        }
    },

    // Retirer des clients d'un groupe
    async removeClientsFromGroup(groupId, clientIds) {
        try {
            const group = await ClientGroup.findById(groupId);
            if (!group) {
                throw new Error('Groupe non trouvé');
            }

            group.clients = group.clients.filter(
                clientId => !clientIds.includes(clientId.toString())
            );

            await group.save();
            logger.info({ msg: 'Clients retirés du groupe', groupId, count: clientIds.length });
            return group;
        } catch (error) {
            logger.error({ msg: 'Erreur retrait clients', error: error.message });
            throw error;
        }
    },

    // Obtenir les clients disponibles d'une agence (qui ne sont pas dans un groupe)
    async getAvailableClientsByAgency(agencyId) {
        try {
            // Récupérer tous les groupes actifs de l'agence
            const groups = await ClientGroup.find({
                agencyId: new mongoose.Types.ObjectId(agencyId),
                status: 'active'
            });

            // Extraire tous les IDs des clients déjà dans des groupes
            const clientsInGroups = [];
            groups.forEach(group => {
                group.clients.forEach(clientId => {
                    clientsInGroups.push(clientId.toString());
                });
            });

            // Récupérer tous les clients de l'agence qui ne sont PAS dans un groupe
            const availableClients = await User.find({
                agencyId: new mongoose.Types.ObjectId(agencyId),
                role: 'client',
                status: 'active',
                _id: { $nin: clientsInGroups } // Exclure les clients déjà dans des groupes
            }).select('firstName lastName email phone address');

            logger.info({
                msg: 'Clients disponibles récupérés',
                agencyId,
                total: availableClients.length,
                inGroups: clientsInGroups.length
            });

            return availableClients;
        } catch (error) {
            logger.error({ msg: 'Erreur récupération clients disponibles', error: error.message });
            throw error;
        }
    }
};
