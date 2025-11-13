const Planning = require('../models/planning.js');
const Collecte = require('../models/Collecte.js');
const User = require('../models/User.js');
const Passge = require('../models/Passage.js');
const logger = require('../utils/logger.js');


const createPlanning = async (planningData) => {
    try {
        // const planning = await Planning.create(planningData);
        const planning = new Planning(planningData);
        const users = await User.find({agencyId: planningData.agencyId, role: 'client', 'address.neighborhood': planningData.zone});
        planning.numberOfClients = 0;

        if (!users || users.length === 0) {
            logger.warn('No clients found for the specified agency and zone');
            await planning.save();
            // throw new Error('No clients found for the specified agency and zone');
            return planning;
        }
        for (const user of users) {
            const passage = await Passge.findOne({agencyId: planningData.agencyId, clientId: user._id, status: true});
            if (passage) {
                const collecteData = new Collecte({
                    agencyId: planningData.agencyId,
                    clientId: user._id,
                    collectorId: planningData.collectorId,
                    date: planningData.date,
                    status: 'Scheduled',
                    code: planningData.code,
                });
                if ( passage.passNumber === passage.dayNumber) {
                    passage.weekNumber += 1;
                    collecteData.nbCollecte = 1;
                    passage.passNumber = 0;
                }else {
                    passage.passNumber +=1;
                    collecteData.nbCollecte = passage.passNumber / passage.dayNumber;
                }
                // await Collecte.create(collecteData);
                await collecteData.save();
                await passage.save();
                planning.numberOfClients += 1;
            }
        }
        await planning.save();
        logger.info('Planning created successfully');
        return planning;
    } catch (error) {
        logger.error('Error creating planning:', error);
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
        const plannings = await Planning.find({ collectorId }).populate('agencyId collectorId');
        if (!plannings || plannings.length === 0) {
            logger.warn(`Aucun planning trouvé pour le collecteur ${collectorId}`);
            return [];
        }
        logger.info('Plannings du collecteur récupérés avec succès');
        return plannings;
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