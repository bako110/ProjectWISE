const Planning = require('../models/planning.js');
const Collecte = require('../models/Collecte.js');
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
            collectorId: planningData.collectorId,
            date: planningData.date
        });

        // ✅ Valider les ObjectId avec logs détaillés
        if (!mongoose.Types.ObjectId.isValid(planningData.agencyId)) {
            logger.error({ msg: 'agencyId invalide', agencyId: planningData.agencyId });
            throw new Error(`agencyId invalide: ${planningData.agencyId}`);
        }
        if (!mongoose.Types.ObjectId.isValid(planningData.collectorId)) {
            logger.error({ msg: 'collectorId invalide', collectorId: planningData.collectorId });
            throw new Error(`collectorId invalide: ${planningData.collectorId}`);
        }
        if (!mongoose.Types.ObjectId.isValid(planningData.managerId)) {
            logger.error({ msg: 'managerId invalide', managerId: planningData.managerId });
            throw new Error(`managerId invalide: ${planningData.managerId}`);
        }

        // ✅ Créer et sauvegarder le planning
        const planning = new Planning(planningData);
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
                    nbCollecte = 1;
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

                // ✅ Créer la collecte
                const collecteData = new Collecte({
                    agencyId: planningData.agencyId,
                    clientId: user._id,
                    collectorId: planningData.collectorId,
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
        const planning = await Planning.find({ collectorId, date: { $gte: debutJour, $lte: finJour } }).populate('agencyId name');
        if (!planning || planning.length === 0) {
            logger.warn(`Aucun planning trouvé pour le collecteur ${collectorId}`);
            return [];
        }
        const collectes = await Collecte.find({ collectorId, date: { $gte: debutJour, $lte: finJour }, status: 'Scheduled' });
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
    getPlanningById,
    updatePlanning,
    deletePlanning,
    getAllPlannings,
    getPlanningsByAgency,
    getPlanningsByCollector
};