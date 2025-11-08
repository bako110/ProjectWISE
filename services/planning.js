const Planning = require('../models/planning.js');
const logger = require('../utils/logger.js');


const createPlanning = async (planningData) => {
    try {
        const planning = await Planning.create(planningData);
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

module.exports = {
    createPlanning,
    getPlanningById,
    updatePlanning,
    deletePlanning,
    getAllPlannings
};