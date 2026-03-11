const Planning = require('../models/planning.js');
const Collecte = require('../models/Collecte.js');
const Agence = require('../models/agency.js');
const Notification = require('../models/Notification');
const User = require('../models/User.js');
const Passge = require('../models/Passage.js');
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
            date: planningData.date
        });

        // ✅ Valider les ObjectId avec logs détaillés
        if (!mongoose.Types.ObjectId.isValid(planningData.agencyId)) {
            logger.error({ msg: 'agencyId invalide', agencyId: planningData.agencyId });
            throw new Error(`agencyId invalide: ${planningData.agencyId}`);
        }
        
        // Valider tous les collecteurs
        if (!planningData.collectors || !Array.isArray(planningData.collectors) || planningData.collectors.length === 0) {
            throw new Error('collectors doit être un tableau non vide');
        }
        
        for (const collectorId of planningData.collectors) {
            if (!mongoose.Types.ObjectId.isValid(collectorId)) {
                logger.error({ msg: 'collectorId invalide', collectorId });
                throw new Error(`collectorId invalide: ${collectorId}`);
            }
        }
        if (!mongoose.Types.ObjectId.isValid(planningData.pricingId)) {
            logger.error({ msg: 'pricingId invalide', pricingId: planningData.pricingId });
            throw new Error(`pricingId invalide: ${planningData.pricingId}`);
        }
        if (!mongoose.Types.ObjectId.isValid(planningData.managerId)) {
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

        // ✅ Préparer la requête
        const query = {
            agencyId: new mongoose.Types.ObjectId(planningData.agencyId),
            role: 'client'
        };

        if (planningData.zone && planningData.zone.trim() !== '') {
            query['address.neighborhood'] = planningData.zone.trim();
        }

        logger.info({ 
            msg: 'Recherche des clients',
            query: {
                agencyId: planningData.agencyId,
                role: 'client',
                neighborhood: planningData.zone
            }
        });

        // ✅ Rechercher les users
        const users = await User.find(query)
            // .select('_id agencyId role address')
            // .lean()
            // .maxTimeMS(10000)
            // .exec();

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

        // ✅ Traiter chaque client
        let clientsAdded = 0;
        const errors = [];

        for (const user of users) {
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

                // ✅ Créer la collecte (utilise le premier collecteur du tableau)
                const collecteData = new Collecte({
                    agencyId: planningData.agencyId,
                    clientId: user._id,
                    collectorId: planningData.collectors[0], // Premier collecteur pour cette collecte
                    date: planningData.date,
                    status: 'Scheduled',
                    code: planning._id,
                    nbCollecte: nbCollecte,
                    type: 'Regular',
                });

                logger.debug({
                    msg: 'Données de collecte préparées',
                    userId: user._id,
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
        const plannings = await Planning.find({ agencyId, status:true });
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
        const planning = await Planning.find({ 
            $or: [
                { collectorId: collectorId },  // Ancien format
                { collectors: collectorId }     // Nouveau format (tableau)
            ],
            date: { $gte: debutJour, $lte: finJour } 
        }).populate('agencyId name');
        
        if (!planning || planning.length === 0) {
            logger.warn(`Aucun planning trouvé pour le collecteur ${collectorId}`);
            return [];
        }
        
        const collectes = await Collecte.find({ 
            collectorId, 
            date: { $gte: debutJour, $lte: finJour }, 
            status: 'Scheduled' 
        });
        
        logger.info('Plannings du collecteur récupérés avec succès');
        const result = { planning, collectes };
        return result;
    } catch (error) {
        logger.error('Erreur lors de la récupération des plannings du collecteur:', error);
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
    getPlanningsByCollector
};