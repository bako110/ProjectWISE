const logger = require('../utils/logger.js');
const { notificationService } = require('../services/notification.service.js');
const {createPlanning, getPlanningsByAgency, getPlanningById, updatePlanning, deletePlanning, getAllPlannings} = require('../services/planning.js');

exports.createPlanning = async (req, res) => {
    try {
        console.log(req.body);
        const {
            managerId, 
            agencyId, 
            pricingId, 
            startTime, 
            endTime, 
            collectorId,  // Ancien format (un seul collecteur)
            collectors,   // Nouveau format (tableau de collecteurs)
            zone, 
            date,
            isRecurring,
            recurrenceType,
            numberOfWeeks
        } = req.body;
        
        // Accepter soit collectorId (ancien) soit collectors (nouveau)
        // Si collectorId est déjà un tableau, on le garde tel quel
        let collectorsArray = collectors;
        if (!collectorsArray && collectorId) {
            collectorsArray = Array.isArray(collectorId) ? collectorId : [collectorId];
        }
        
        if (!managerId || !agencyId || !startTime || !endTime || !collectorsArray || !zone || !date) {
            return res.status(400).json({ error: 'Missing required fields. Provide collectorId or collectors array.' });
        }

        logger.info('Creating planning...');
        
        const planningData = {
            managerId, 
            agencyId,
            pricingId, 
            startTime, 
            endTime, 
            collectors: collectorsArray, 
            zone, 
            date
        };

        if (isRecurring) {
            planningData.isRecurring = true;
            planningData.recurrenceType = recurrenceType || 'weekly';
            planningData.numberOfWeeks = numberOfWeeks || 1;
            
            logger.info({
                msg: 'Planning récurrent demandé',
                numberOfWeeks: planningData.numberOfWeeks,
                recurrenceType: planningData.recurrenceType
            });
        }

        const planning = await createPlanning(planningData);
        
        const message = isRecurring 
            ? `Un planning récurrent a été créé pour ${numberOfWeeks} semaines à partir du ${date}.`
            : `Un nouveau planning a été créé pour le ${date}.`;
            
        // Envoyer une notification à chaque collecteur
        for (const collector of collectorsArray) {
            await notificationService.createNotification({
                user: collector,
                message: message,
                type: 'Planning'
            });
        }
        
        logger.info('Planning created successfully');
        res.status(201).json(planning);
    } catch (error) {
        logger.error('Error creating planning:', error);
        res.status(500).json({ error: 'Error creating planning' });
    }
};


exports.createPlanningNew = async (req, res) => {
    try {
        const {managerId, agencyId, startTime, endTime, collectors, zone, date, pricingId} = req.body;
        
        if (!managerId || !agencyId || !startTime || !endTime || !collectors || !zone || !date || !pricingId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const planning = await createPlanning({managerId, agencyId, startTime, endTime, collectors, zone, date, pricingId});
        // const message = `Un nouveau planning a été créé pour le ${date}.`;
        // for (const collector of collectors) {
        //     await notificationService.createNotification({
        //         user: collector,
        //         message: message,
        //         type: 'Planning'
        //     });
        // }
        // logger.info('Planning created successfully');
        res.status(201).json(planning);
    }catch (error) {
        logger.error('Error creating planning:', error);
        res.status(500).json({ error: 'Error creating planning' });
    }
};


exports.getPlanningById = async (req, res) => {
    try {
        const planning = await getPlanningById(req.params.id);
        logger.info('Planning retrieved successfully');
        res.status(200).json(planning);
    } catch (error) {
        logger.error('Error retrieving planning:', error);
        res.status(500).json({ error: 'Error retrieving planning' });
    }
};


exports.updatePlanning = async (req, res) => {
    try {
        const planning = await updatePlanning(req.params.id, req.body);
        logger.info('Planning updated successfully');
        res.status(200).json(planning);
    } catch (error) {
        logger.error('Error updating planning:', error);
        res.status(500).json({ error: 'Error updating planning' });
    }
};


exports.deletePlanning = async (req, res) => {
    try {
        const planning = await deletePlanning(req.params.id);
        logger.info('Planning deleted successfully');
        res.status(200).json(planning);
    } catch (error) {
        logger.error('Error deleting planning:', error);
        res.status(500).json({ error: 'Error deleting planning' });
    }
};


exports.getAllPlannings = async (req, res) => {
    try {
        const plannings = await getAllPlannings();
        logger.info('Plannings retrieved successfully');
        res.status(200).json(plannings);
    } catch (error) {
        logger.error('Error retrieving plannings:', error);
        res.status(500).json({ error: 'Error retrieving plannings' });
    }
};

exports.getPlanningsByAgency = async (req, res) => {
    try {
        const agencyId = req.params.agencyId;
        if (!agencyId) {
            return res.status(400).json({ error: 'Missing agencyId parameter' });
        }
        const plannings = await getPlanningsByAgency(agencyId);
        logger.info('Plannings retrieved successfully');
        res.status(200).json(plannings);
    } catch (error) {
        logger.error('Error retrieving plannings:', error);
        res.status(500).json({ error: 'Error retrieving plannings' });
    }
};

exports.getPlanningsByCollector = async (req, res) => {
    try {
        const { collectorId } = req.params;

        if (!collectorId) {
            return res.status(400).json({ error: 'collectorId manquant' });
        }

        const plannings = await getPlanningsByCollector(collectorId);
        logger.info(`Plannings du collecteur ${collectorId} récupérés avec succès`);
        res.status(200).json(plannings);
    } catch (error) {
        logger.error('Erreur lors de la récupération des plannings du collecteur:', error);
        res.status(500).json({ error: 'Erreur interne lors de la récupération du planning du collecteur' });
    }
};
