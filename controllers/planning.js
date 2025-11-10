const logger = require('../utils/logger.js');
const {createPlanning, getPlanningById, updatePlanning, deletePlanning, getAllPlannings} = require('../services/planning.js');

exports.createPlanning = async (req, res) => {
    try {
        console.log(req.body);
        const {managerId, agencyId, startTime, endTime, collectorId, zone, date} = req.body;
        
        if (!managerId || !agencyId || !startTime || !endTime || !collectorId || !zone || !date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const data = req.body;
        
        const planning = await createPlanning(data);
        logger.info('Planning created successfully');
        res.status(201).json(planning);
    } catch (error) {
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