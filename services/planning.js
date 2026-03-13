const Planning = require('../models/planning.js');
const Collecte = require('../models/Collecte.js');
const Agence = require('../models/agency.js');
const Notification = require('../models/Notification');
const User = require('../models/User.js');
const Passge = require('../models/Passage.js');
const Team = require('../models/Team.js');
const ClientGroup = require('../models/ClientGroup.js');
const logger = require('../utils/logger.js');


const mongoose = require('mongoose');

const createPlanning = async (planningData) => {
    const startTime = Date.now();
    
    try {
        logger.info({
            msg: '=== DÉBUT CRÉATION PLANNING ===',
            zone: planningData.zone,
            agencyId: planningData.agencyId,
            collectors: planningData.collectors,
            teamId: planningData.teamId,
            clientGroupId: planningData.clientGroupId,
            date: planningData.date
        });

        // ✅ Déterminer les collecteurs à utiliser
        let collectorsToUse = [];
        let clientsToSchedule = [];
        
        // Cas 1: Planning avec une équipe
        if (planningData.teamId) {
            const team = await Team.findById(planningData.teamId).populate('collectors');
            if (!team) {
                throw new Error('Équipe non trouvée');
            }
            collectorsToUse = team.collectors.map(c => c._id);
            planningData.collectors = collectorsToUse; // Synchroniser
            
            logger.info({ 
                msg: '✅ Équipe trouvée', 
                teamName: team.name,
                collectorsCount: collectorsToUse.length 
            });
            
            // Si un groupe de clients est spécifié
            if (planningData.clientGroupId) {
                const clientGroup = await ClientGroup.findById(planningData.clientGroupId);
                if (!clientGroup) {
                    throw new Error('Groupe de clients non trouvé');
                }
                clientsToSchedule = clientGroup.clients;
                logger.info({ 
                    msg: '✅ Groupe de clients trouvé', 
                    clientsCount: clientsToSchedule.length 
                });
            }
        } 
        // Cas 2: Planning avec collecteurs manuels
        else if (planningData.collectors && planningData.collectors.length > 0) {
            collectorsToUse = planningData.collectors;
        } else {
            throw new Error('Aucun collecteur ou équipe spécifié');
        }

        // ✅ Valider les ObjectId
        if (!mongoose.Types.ObjectId.isValid(planningData.agencyId)) {
            logger.error({ msg: 'agencyId invalide', agencyId: planningData.agencyId });
            throw new Error(`agencyId invalide: ${planningData.agencyId}`);
        }
        
        // Valider tous les collecteurs
        for (const collectorId of collectorsToUse) {
            if (!mongoose.Types.ObjectId.isValid(collectorId)) {
                logger.error({ msg: 'collectorId invalide', collectorId });
                throw new Error(`collectorId invalide: ${collectorId}`);
            }
        }
        
        if (planningData.pricingId && !mongoose.Types.ObjectId.isValid(planningData.pricingId)) {
            logger.error({ msg: 'pricingId invalide', pricingId: planningData.pricingId });
            throw new Error(`pricingId invalide: ${planningData.pricingId}`);
        }
        if (planningData.managerId && !mongoose.Types.ObjectId.isValid(planningData.managerId)) {
            logger.error({ msg: 'managerId invalide', managerId: planningData.managerId });
            throw new Error(`managerId invalide: ${planningData.managerId}`);
        }

        // Créer et sauvegarder le planning
        const planning = new Planning(planningData);
        
        // Gérer la récurrence
        if (planningData.isRecurring && planningData.numberOfWeeks > 1) {
            planning.weeksRemaining = planningData.numberOfWeeks - 1;
            
            const daysToAdd = planningData.recurrenceType === 'weekly' ? 7 : 
                             planningData.recurrenceType === 'biweekly' ? 14 : 30;
            
            const nextDate = new Date(planningData.date);
            nextDate.setDate(nextDate.getDate() + daysToAdd);
            planning.nextDuplicationDate = nextDate;
            
            planning.parentPlanningId = null;
            
            logger.info({
                msg: 'Planning récurrent configuré',
                numberOfWeeks: planningData.numberOfWeeks,
                weeksRemaining: planning.weeksRemaining,
                nextDuplicationDate: nextDate
            });
        }
        
        await planning.save();
        
        logger.info({ 
            msg: '✅ Planning créé et sauvegardé',
            planningId: planning._id.toString(),
            zone: planningData.zone
        });

        // ✅ Rechercher les clients si pas de groupe spécifié
        let users = [];
        
        if (clientsToSchedule.length > 0) {
            // Utiliser les clients du groupe
            users = await User.find({
                _id: { $in: clientsToSchedule },
                role: 'client',
                status: 'active'
            });
        } else {
            // Recherche par zone (comportement original)
            const query = {
                agencyId: new mongoose.Types.ObjectId(planningData.agencyId),
                role: 'client',
                status: 'active'
            };

            if (planningData.zone && planningData.zone.trim() !== '') {
                query['address.neighborhood'] = planningData.zone.trim();
            }

            logger.info({ 
                msg: 'Recherche des clients par zone',
                query: {
                    agencyId: planningData.agencyId,
                    role: 'client',
                    neighborhood: planningData.zone
                }
            });

            users = await User.find(query);
        }

        // Envoyer des notifications
        for (const user of users) {
            await Notification.create({
                user: user._id,
                message: `Un nouveau planning a été créé pour le ${planningData.date}.`,
                type: 'Planning'
            });
        }

        logger.info({ 
            msg: `${users.length} clients trouvés`,
            zone: planningData.zone,
            count: users.length
        });

        // Si aucun client
        if (!users || users.length === 0) {
            logger.warn({ 
                msg: 'Aucun client trouvé pour cette zone',
                zone: planningData.zone,
                agencyId: planningData.agencyId
            });
            planning.numberOfClients = 0;
            await planning.save();
            return planning;
        }

        // ✅ Traiter chaque client avec RÉPARTITION ÉQUITABLE
        let clientsAdded = 0;
        const errors = [];

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            
            try {
                logger.debug({ 
                    msg: 'Traitement du client',
                    userId: user._id,
                    planningId: planning._id
                });

                // ✅ Rechercher le passage
                const passage = await Passge.findOne({
                    agencyId: new mongoose.Types.ObjectId(planningData.agencyId),
                    clientId: user._id,
                    status: true
                }).maxTimeMS(5000);

                if (!passage) {
                    logger.debug({ 
                        msg: 'Pas de passage actif',
                        userId: user._id
                    });
                    continue;
                }

                logger.debug({
                    msg: 'Passage trouvé',
                    userId: user._id,
                    passageId: passage._id,
                    passNumber: passage.passNumber,
                    dayNumber: passage.dayNumber,
                    weekNumber: passage.weekNumber
                });

                // ✅ Calculer le numéro de collecte
                let nbCollecte;
                
                if (passage.passNumber >= passage.dayNumber) {
                    passage.weekNumber += 1;
                    passage.passNumber = 1;
                    nbCollecte = 1.0;
                    logger.debug({ 
                        msg: 'Nouvelle semaine',
                        userId: user._id,
                        weekNumber: passage.weekNumber
                    });
                } else {
                    passage.passNumber += 1;
                    nbCollecte = passage.passNumber / passage.dayNumber;
                    logger.debug({ 
                        msg: 'Incrémentation dans la semaine',
                        userId: user._id,
                        passNumber: passage.passNumber,
                        nbCollecte
                    });
                }

                // ✅ RÉPARTITION ÉQUITABLE: Rotation entre collecteurs
                const collectorIndex = clientsAdded % collectorsToUse.length;
                const assignedCollector = collectorsToUse[collectorIndex];

                // ✅ Créer la collecte avec le collecteur assigné
                const collecteData = new Collecte({
                    agencyId: planningData.agencyId,
                    clientId: user._id,
                    collectorId: assignedCollector, // ✅ Collecteur assigné en rotation
                    date: planningData.date,
                    status: 'Scheduled',
                    code: planning._id,
                    nbCollecte: nbCollecte,
                    type: 'Regular',
                });

                logger.debug({
                    msg: 'Données de collecte préparées avec répartition',
                    userId: user._id,
                    assignedCollectorIndex: collectorIndex,
                    assignedCollector: assignedCollector,
                    collecteData: {
                        agencyId: collecteData.agencyId,
                        clientId: collecteData.clientId,
                        collectorId: collecteData.collectorId,
                        code: collecteData.code,
                        nbCollecte: collecteData.nbCollecte
                    }
                });

                // ✅ Sauvegarder
                await collecteData.save();
                logger.debug({ 
                    msg: 'Collecte sauvegardée',
                    userId: user._id,
                    collecteId: collecteData._id
                });

                await passage.save();
                logger.debug({ 
                    msg: 'Passage mis à jour',
                    userId: user._id,
                    passageId: passage._id
                });
                
                clientsAdded++;

            } catch (userError) {
                // ✅ LOG DÉTAILLÉ DE L'ERREUR
                logger.error({
                    msg: `❌ Erreur lors du traitement du client`,
                    userId: user._id,
                    planningId: planning._id,
                    error: {
                        message: userError.message,
                        name: userError.name,
                        code: userError.code,
                        stack: userError.stack
                    },
                    context: {
                        agencyId: planningData.agencyId,
                        zone: planningData.zone,
                        date: planningData.date
                    }
                });
                
                errors.push({
                    userId: user._id.toString(),
                    error: userError.message,
                    errorName: userError.name
                });
            }
        }

        // ✅ Mettre à jour le planning
        planning.numberOfClients = clientsAdded;
        await planning.save();

        // ✅ Logger le résumé
        logger.info({
            msg: '=== PLANNING CRÉÉ AVEC SUCCÈS ===',
            planningId: planning._id.toString(),
            clientsScheduled: clientsAdded,
            clientsTotal: users.length,
            errorsCount: errors.length,
            duration: `${Date.now() - startTime}ms`
        });

        if (errors.length > 0) {
            logger.warn({
                msg: 'Erreurs lors de la création des collectes',
                count: errors.length,
                errors: errors
            });
        }

        return planning;

    } catch (error) {
        logger.error({
            msg: '❌ ERREUR FATALE CRÉATION PLANNING',
            error: {
                message: error.message,
                name: error.name,
                code: error.code,
                stack: error.stack
            },
            planningData: {
                agencyId: planningData.agencyId,
                zone: planningData.zone,
                date: planningData.date,
                collectorId: planningData.collectorId
            },
            duration: `${Date.now() - startTime}ms`
        });
        
        throw error;
    }
};

// const createPlanningNew = async (planningData) => {
//     try {
//         let clientValid = [];
//         const manager = await User.findById(planningData.managerId);
//         if (!manager) {
//             throw new Error('Manager not found');
//         }

//         const agency = await Agence.findById(planningData.agencyId);
//         if (!agency) {
//             throw new Error('Agency not found');
//         }
        
//         for (const collectorId of planningData.collectors) {
//             const collector = await User.findById(collectorId);
//             if (!collector) {
//                 throw new Error(`Collector not found: ${collectorId}`);
//             }
//         }

//         if (agency.zoneActivite && !agency.zoneActivite.includes(planningData.zone)) {
//             throw new Error(`Zone d'activité ${planningData.zone} n'est pas dans les zones de l'agence`);
//         }

//         const clients = await User.find({
//             agencyId: planningData.agencyId,
//             role: 'client',
//             'address.neighborhood': planningData.zone
//         }).populate('subscriptionId');

//         const planning = new Planning(planningData);

//         for (const client of clients) {
//             const passage = await Passge.findOne({
//                 agencyId: planningData.agencyId,
//                 clientId: client._id,
//                 status: true
//             });
            
//             if (!passage) {
//                 continue;
//             }

//             if (client.subscription._id === planningData.pricingId) {
//                 clientValid.push(client);
//                 const collecteData = new Collecte({
//                     agencyId: planningData.agencyId,
//                     clientId: client._id,
//                     collectors: planningData.collectors,
//                     date: planningData.date,
//                     status: 'Scheduled',
//                     code: planning._id,
//                 });
//                 await collecteData.save();

//                 passage.passNumber += 1;
//                 if (passage.passNumber > passage.dayNumber) {
//                     passage.weekNumber += 1;
//                     passage.passNumber = 1;
//                 }
//                 await passage.save();
//             }
//         }

//         planningData.numberOfClients = clientValid.length;

//         await planning.save();
//         logger.info('Planning created successfully');
//         return planning;
//     } catch (error) {
//         logger.error('Error creating planning:', error);
//         throw error;
//     }
// };

const getPlanningById = async (planningId) => {
    try {
        const planning = await Planning.findById(planningId);
        if (!planning) {
            throw new Error('Planning not found');
        }
        logger.info('Planning retrieved successfully');
        return planning;
    } catch (error) {
        logger.error('Error retrieving planning:', error);
        throw error;
    }
};

const updatePlanning = async (planningId, planningData) => {
    try {
        const planning = await Planning.findByIdAndUpdate(planningId, planningData, { new: true });
        if (!planning) {
            throw new Error('Planning not found');
        }
        logger.info('Planning updated successfully');
        return planning;
    } catch (error) {
        logger.error('Error updating planning:', error);
        throw error;
    }
};

const deletePlanning = async (planningId) => {
    try {
        const planning = await Planning.findByIdAndDelete(planningId);
        if (!planning) {
            throw new Error('Planning not found');
        }
        logger.info('Planning deleted successfully');
        return planning;
    } catch (error) {
        logger.error('Error deleting planning:', error);
        throw error;
    }
};

const getAllPlannings = async () => {
    try {
        const plannings = await Planning.find();
        logger.info('Plannings retrieved successfully');
        return plannings;
    } catch (error) {
        logger.error('Error retrieving plannings:', error);
        throw error;
    }
};

const getPlanningsByAgency = async (agencyId) => {
    try {
        const plannings = await Planning.find({ 
            agencyId, 
            status: true
        })
        .populate('collectors', '_id firstName lastName email phone role')
        .populate('managerId', '_id firstName lastName email phone')
        .populate('pricingId', '_id planType price description numberOfPasses')
        .sort({ date: -1 }); // Trier par date décroissante
        
        logger.info('Plannings retrieved successfully');
        return plannings;
    } catch (error) {
        logger.error('Error retrieving plannings:', error);
        throw error;
    }
};

const getPlanningsByCollector = async (collectorId) => {
    try {
        const debutJour = new Date(new Date().setHours(0, 0, 0, 0));
        const finJour = new Date(new Date().setHours(23, 59, 59, 999));
        
        // Chercher dans les deux formats: ancien (collectorId) et nouveau (collectors array)
        const plannings = await Planning.find({ 
            $or: [
                { collectorId: collectorId },  // Ancien format
                { collectors: collectorId }     // Nouveau format (tableau)
            ],
            date: { $gte: debutJour, $lte: finJour } 
        })
        .populate('agencyId', 'name')
        .populate('teamId', 'name leaderId')
        .populate('clientGroupId', 'name clients zone');
        
        if (!plannings || plannings.length === 0) {
            logger.warn(`Aucun planning trouvé pour le collecteur ${collectorId}`);
            return [];
        }
        
        // Récupérer les collectes assignées à ce collecteur aujourd'hui
        const collectes = await Collecte.find({ 
            collectorId, 
            date: { $gte: debutJour, $lte: finJour }, 
            status: 'Scheduled' 
        }).populate('clientId', 'firstName lastName phone address');
        
        // Enrichir les plannings avec les informations détaillées
        const enrichedPlannings = await Promise.all(plannings.map(async (planning) => {
            const planningObj = planning.toObject();
            
            // Si le planning a un groupe de clients, récupérer le nombre de clients
            if (planningObj.clientGroupId) {
                const clientGroup = await ClientGroup.findById(planningObj.clientGroupId);
                planningObj.clientGroupDetails = {
                    _id: clientGroup._id,
                    name: clientGroup.name,
                    zone: clientGroup.zone,
                    totalClients: clientGroup.clients.length
                };
            }
            
            // Compter combien de clients sont assignés à ce collecteur dans ce planning
            const myCollectes = collectes.filter(c => 
                c.code && c.code.toString() === planning._id.toString()
            );
            
            planningObj.myClientsCount = myCollectes.length;
            
            return planningObj;
        }));
        
        logger.info('Plannings du collecteur récupérés avec succès');
        
        return { 
            plannings: enrichedPlannings, 
            collectes: collectes.length,
            totalClients: collectes.length
        };
    } catch (error) {
        logger.error('Erreur lors de la récupération des plannings du collecteur:', error);
        throw error;
    }
};


/**
 * Obtenir la liste détaillée des clients d'un collecteur pour un planning spécifique
 */
const getMyClientsForPlanning = async (collectorId, planningId) => {
    try {
        // Vérifier que le planning existe et que le collecteur y est assigné
        const planning = await Planning.findById(planningId)
            .populate('teamId', 'name')
            .populate('clientGroupId', 'name zone');
        
        if (!planning) {
            throw new Error('Planning non trouvé');
        }
        
        // Vérifier que le collecteur fait partie de ce planning
        const isAssigned = planning.collectors.some(
            c => c.toString() === collectorId
        ) || (planning.collectorId && planning.collectorId.toString() === collectorId);
        
        if (!isAssigned) {
            throw new Error('Vous n\'êtes pas assigné à ce planning');
        }
        
        // Récupérer les collectes de ce collecteur pour ce planning
        const collectes = await Collecte.find({
            collectorId,
            code: planningId,
            status: 'Scheduled'
        }).populate('clientId', 'firstName lastName phone address email');
        
        logger.info({ 
            msg: 'Liste des clients récupérée',
            collectorId,
            planningId,
            count: collectes.length
        });
        
        return {
            planning: {
                _id: planning._id,
                zone: planning.zone,
                date: planning.date,
                startTime: planning.startTime,
                endTime: planning.endTime,
                team: planning.teamId,
                clientGroup: planning.clientGroupId
            },
            clients: collectes.map(c => ({
                collecteId: c._id,
                client: c.clientId,
                nbCollecte: c.nbCollecte,
                type: c.type,
                status: c.status
            })),
            totalClients: collectes.length
        };
    } catch (error) {
        logger.error({ msg: 'Erreur récupération clients du collecteur', error: error.message });
        throw error;
    }
};

module.exports = {
    createPlanning,
    // createPlanningNew,
    getPlanningById,
    updatePlanning,
    deletePlanning,
    getAllPlannings,
    getPlanningsByAgency,
    getPlanningsByCollector,
    getMyClientsForPlanning
};