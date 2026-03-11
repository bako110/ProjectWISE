const Planning = require('../models/planning.js');
const Collecte = require('../models/Collecte.js');
const Notification = require('../models/Notification');
const User = require('../models/User.js');
const Passge = require('../models/Passage.js');
const logger = require('../utils/logger.js');
const mongoose = require('mongoose');

/**
 * Duplique un planning pour la semaine suivante
 * @param {ObjectId} planningId - ID du planning à dupliquer
 * @returns {Object} - Nouveau planning créé
 */
const duplicatePlanning = async (planningId) => {
    const startTime = Date.now();
    
    try {
        logger.info({
            msg: '=== DÉBUT DUPLICATION PLANNING ===',
            planningId: planningId.toString()
        });

        const originalPlanning = await Planning.findById(planningId);
        
        if (!originalPlanning) {
            throw new Error(`Planning ${planningId} introuvable`);
        }

        if (!originalPlanning.isRecurring) {
            logger.warn({ msg: 'Planning non récurrent, duplication annulée', planningId });
            return null;
        }

        if (originalPlanning.weeksRemaining <= 0) {
            logger.info({ msg: 'Plus de semaines restantes, duplication terminée', planningId });
            originalPlanning.isRecurring = false;
            await originalPlanning.save();
            return null;
        }

        const daysToAdd = originalPlanning.recurrenceType === 'weekly' ? 7 : 
                         originalPlanning.recurrenceType === 'biweekly' ? 14 : 30;

        const newDate = new Date(originalPlanning.date);
        newDate.setDate(newDate.getDate() + daysToAdd);

        // Récupérer les collecteurs (nouveau format) ou collectorId (ancien format)
        const collectorsArray = originalPlanning.collectors && originalPlanning.collectors.length > 0 
            ? originalPlanning.collectors 
            : (originalPlanning.collectorId ? [originalPlanning.collectorId] : []);

        const newPlanningData = {
            managerId: originalPlanning.managerId,
            agencyId: originalPlanning.agencyId,
            zone: originalPlanning.zone,
            date: newDate,
            startTime: originalPlanning.startTime,
            endTime: originalPlanning.endTime,
            collectors: collectorsArray,
            pricingId: originalPlanning.pricingId,
            isRecurring: true,
            recurrenceType: originalPlanning.recurrenceType,
            numberOfWeeks: originalPlanning.numberOfWeeks,
            weeksRemaining: originalPlanning.weeksRemaining - 1,
            parentPlanningId: originalPlanning.parentPlanningId || originalPlanning._id,
            nextDuplicationDate: null
        };

        logger.info({
            msg: 'Création du nouveau planning',
            originalDate: originalPlanning.date,
            newDate: newDate,
            weeksRemaining: newPlanningData.weeksRemaining
        });

        const newPlanning = new Planning(newPlanningData);
        await newPlanning.save();

        logger.info({
            msg: '✅ Nouveau planning créé',
            newPlanningId: newPlanning._id.toString()
        });

        const query = {
            agencyId: new mongoose.Types.ObjectId(newPlanningData.agencyId),
            role: 'client'
        };

        if (newPlanningData.zone && newPlanningData.zone.trim() !== '') {
            query['address.neighborhood'] = newPlanningData.zone.trim();
        }

        const users = await User.find(query);

        logger.info({
            msg: `${users.length} clients trouvés pour duplication`,
            zone: newPlanningData.zone
        });

        if (!users || users.length === 0) {
            newPlanning.numberOfClients = 0;
            await newPlanning.save();
            
            originalPlanning.weeksRemaining -= 1;
            if (originalPlanning.weeksRemaining > 0) {
                const nextDate = new Date(newDate);
                nextDate.setDate(nextDate.getDate() + daysToAdd);
                originalPlanning.nextDuplicationDate = nextDate;
            } else {
                originalPlanning.isRecurring = false;
            }
            await originalPlanning.save();
            
            return newPlanning;
        }

        let clientsAdded = 0;
        const errors = [];

        for (const user of users) {
            try {
                const passage = await Passge.findOne({
                    agencyId: new mongoose.Types.ObjectId(newPlanningData.agencyId),
                    clientId: user._id,
                    status: true
                }).maxTimeMS(5000);

                if (!passage) {
                    continue;
                }

                let nbCollecte;
                
                if (passage.passNumber >= passage.dayNumber) {
                    passage.weekNumber += 1;
                    passage.passNumber = 1;
                    nbCollecte = 1.0;
                } else {
                    passage.passNumber += 1;
                    nbCollecte = passage.passNumber / passage.dayNumber;
                }

                const collecteData = new Collecte({
                    agencyId: newPlanningData.agencyId,
                    clientId: user._id,
                    collectorId: newPlanningData.collectors[0], // Premier collecteur du tableau
                    date: newDate,
                    status: 'Scheduled',
                    code: newPlanning._id,
                    nbCollecte: nbCollecte,
                    type: 'Regular',
                });

                await collecteData.save();
                await passage.save();

                await Notification.create({
                    user: user._id,
                    message: `Un nouveau planning a été créé automatiquement pour le ${newDate.toLocaleDateString()}.`,
                    type: 'Planning'
                });
                
                clientsAdded++;

            } catch (userError) {
                logger.error({
                    msg: `❌ Erreur lors du traitement du client`,
                    userId: user._id,
                    error: userError.message
                });
                
                errors.push({
                    userId: user._id.toString(),
                    error: userError.message
                });
            }
        }

        newPlanning.numberOfClients = clientsAdded;
        await newPlanning.save();

        originalPlanning.weeksRemaining -= 1;
        if (originalPlanning.weeksRemaining > 0) {
            const nextDate = new Date(newDate);
            nextDate.setDate(nextDate.getDate() + daysToAdd);
            originalPlanning.nextDuplicationDate = nextDate;
        } else {
            originalPlanning.isRecurring = false;
            originalPlanning.nextDuplicationDate = null;
        }
        await originalPlanning.save();

        logger.info({
            msg: '=== DUPLICATION PLANNING RÉUSSIE ===',
            originalPlanningId: planningId.toString(),
            newPlanningId: newPlanning._id.toString(),
            clientsScheduled: clientsAdded,
            weeksRemaining: originalPlanning.weeksRemaining,
            duration: `${Date.now() - startTime}ms`
        });

        return newPlanning;

    } catch (error) {
        logger.error({
            msg: '❌ ERREUR FATALE DUPLICATION PLANNING',
            planningId: planningId.toString(),
            error: {
                message: error.message,
                stack: error.stack
            },
            duration: `${Date.now() - startTime}ms`
        });
        
        throw error;
    }
};

/**
 * Trouve et duplique tous les plannings récurrents qui doivent être dupliqués aujourd'hui
 */
const processPendingDuplications = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        logger.info({
            msg: '=== DÉBUT TRAITEMENT DUPLICATIONS PLANNINGS ===',
            date: today
        });

        const planningsToProcess = await Planning.find({
            isRecurring: true,
            weeksRemaining: { $gt: 0 },
            nextDuplicationDate: { $lte: today }
        });

        logger.info({
            msg: `${planningsToProcess.length} plannings à dupliquer`,
            count: planningsToProcess.length
        });

        const results = [];
        for (const planning of planningsToProcess) {
            try {
                const newPlanning = await duplicatePlanning(planning._id);
                results.push({
                    originalId: planning._id,
                    newId: newPlanning ? newPlanning._id : null,
                    success: true
                });
            } catch (error) {
                logger.error({
                    msg: 'Erreur lors de la duplication',
                    planningId: planning._id,
                    error: error.message
                });
                results.push({
                    originalId: planning._id,
                    success: false,
                    error: error.message
                });
            }
        }

        logger.info({
            msg: '=== FIN TRAITEMENT DUPLICATIONS PLANNINGS ===',
            total: planningsToProcess.length,
            success: results.filter(r => r.success).length,
            errors: results.filter(r => !r.success).length
        });

        return results;

    } catch (error) {
        logger.error({
            msg: '❌ ERREUR TRAITEMENT DUPLICATIONS',
            error: error.message
        });
        throw error;
    }
};

module.exports = {
    duplicatePlanning,
    processPendingDuplications
};
