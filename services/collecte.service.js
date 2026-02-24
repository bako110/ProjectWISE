const Collecte = require('../models/Collecte');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Créer une nouvelle collecte
exports.createCollecte = async (data) => {
    const collecte = new Collecte(data);
    return await collecte.save();
};

// Récupérer les collectes par agence
exports.getCollectesByAgency = async (agencyId) => {
    return await Collecte.find({ agencyId });
};

// Mettre à jour le statut d'une collecte
exports.updateCollecteStatus = async (collecteId, status) => {
    return await Collecte.findByIdAndUpdate(collecteId, { status }, { new: true });
};

// Récupérer une collecte par ID
exports.getCollecteById = async (collecteId) => {
    return await Collecte.findById(collecteId);
};

// Supprimer une collecte
exports.deleteCollecte = async (collecteId) => {
    return await Collecte.findByIdAndDelete(collecteId);
};

// Récupérer les collectes par client
exports.getCollectesByClient = async (clientId) => {
    return await Collecte.find({ clientId });
};

// Récupérer les collectes par collecteur
exports.getCollectesByCollector = async (collectorId) => {
    return await Collecte.find({ collectorId });
};

// Récupérer toutes les collectes
exports.getAllCollectes = async () => {
    return await Collecte.find();
};

exports.collecteService = {

    /** 🔹 HISTORIQUES UTILISATEUR */
    async UserCollecteHistory(userId) {
        if (!userId) throw new Error('User ID is required');
        return await Collecte.find({ clientId: userId, $or: [{ status: 'Completed' }, { status: 'Collected' }] }).sort({ date: -1 });
    },

    async UserReportingHistory(userId) {
        if (!userId) throw new Error('User ID is required');
        return await Collecte.find({ clientId: userId, status: 'Reported' })
                            .populate('agencyId', 'name')
                            .populate('collectorId', 'lastName firstName email')
                            .populate('code', 'startTime endTime zone agencyId')
                            // .populate('clientId', 'lastName firstName email')
                            .sort({ date: -1 });
    },

    // async UserScheduledCollectes(userId, query) {
    //     if (!userId) throw new Error('User ID is required');
    //     logger.info(`Fetching scheduled collectes for user ID: ${userId}`);
    //     return await Collecte.find({ clientId: userId, status: 'Scheduled' }).populate('agencyId', 'name').populate('collectorId', 'lastName firstName').populate('code', 'startTime endTime zone agencyId').sort({ date: -1 });
    // },
    async UserScheduledCollectes(userId, query = {}) {
        if (!userId) throw new Error('User ID is required');

        logger.info(`Fetching scheduled collectes for user ID: ${userId}`);

        const filter = {
            clientId: userId,
            status: 'Scheduled'
        };

        // 🔎 Filtre sur date de création
        if (query.startDate || query.endDate) {
            filter.createdAt = {};

            if (query.startDate) {
            filter.createdAt.$gte = new Date(query.startDate);
            }

            if (query.endDate) {
            filter.createdAt.$lte = new Date(query.endDate);
            }
        }

        return await Collecte.find(filter)
            .populate('agencyId', 'name')
            .populate('collectorId', 'lastName firstName')
            .populate({
            path: 'code',
            select: 'startTime endTime zone agencyId',
            populate: {
                path: 'agencyId',
                select: 'name'
            }
            })
            .sort({ date: -1 });
    },


    /** 🔹 AGENCE */
    async AgencyCollectes(agencyId) {
        if (!agencyId) throw new Error('Agency ID is required');
        // const dateNow = new Date();
        // debutjour = new Date(dateNow.setHours(0, 0, 0, 0));
        // finjour = new Date(dateNow.setHours(23, 59, 59, 999));
        // return await Collecte.find({ agencyId, status: 'Scheduled', date: { $gte: debutjour, $lte: finjour } })
        return await Collecte.find({ agencyId, status: 'Scheduled' })
                            .populate('agencyId', 'name')
                            .populate('clientId', 'lastName firstName email')
                            .populate('collectorId', 'lastName firstName email')
                            .populate('code', 'startTime endTime zone agencyId')
                            .sort({ date: -1 });
    },

    async AgencyCompletedCollectes(agencyId) {
        if (!agencyId) throw new Error('Agency ID is required');
        return await Collecte.find({ agencyId, status: 'Collected' })
                            .populate('agencyId', 'name')
                            .populate('clientId', 'lastName firstName email')
                            .populate('collectorId', 'lastName firstName email')
                            .sort({ date: -1 });
    },

    async AgencyReportingCollectes(agencyId) {
        if (!agencyId) throw new Error('Agency ID is required');
        return await Collecte.find({ agencyId, status: 'Reported' })
                            .populate('agencyId', 'name')
                            .populate('clientId', 'lastName firstName email')
                            .populate('collectorId', 'lastName firstName email')
                            .sort({ date: -1 });
    },

    /** 🔹 COLLECTEUR */
    async CollectorCollectes(collectorId) {
        if (!collectorId) throw new Error('Collector ID is required');
        return await Collecte.find({ collectorId, status: 'Scheduled' })
                              .populate('agencyId', 'name')
                              .populate('clientId', 'lastName firstName email')
                              .populate('code', 'startTime endTime zone agencyId')
                              .sort({ date: -1 });
    },

    async CollectorCompletedCollectes(collectorId) {
        if (!collectorId) throw new Error('Collector ID is required');
        return await Collecte.find({ collectorId, status: 'Collected' })
                              .populate('agencyId', 'name')
                              .populate('clientId', 'lastName firstName email')
                              .populate('code', 'startTime endTime zone agencyId')
                              .sort({ date: -1 });
    },

    async CollectorReportingCollectes(collectorId) {
        if (!collectorId) throw new Error('Collector ID is required');
        return await Collecte.find({ collectorId, status: 'Reported' })
                              .populate('agencyId', 'name')
                              .populate('clientId', 'lastName firstName email')
                              .populate('code', 'startTime endTime zone agencyId')
                              .sort({ date: -1 });
    },

    /** 🔥 NOUVEAU : SIGNALER UNE COLLECTE */
async reportCollecte(collecteId, data, reporterId) {
    if (!collecteId) throw new Error("L'ID de la collecte est requis");
    if (!mongoose.Types.ObjectId.isValid(collecteId)) throw new Error("ID de collecte invalide");
    if (!reporterId) throw new Error("L'ID de l'utilisateur est requis");
    if (!mongoose.Types.ObjectId.isValid(reporterId)) throw new Error("ID utilisateur invalide");

    const collecte = await Collecte.findById(collecteId);
    if (!collecte) throw new Error("Collecte introuvable");

    collecte.status = "Reported";
    collecte.reportedBy = reporterId;

    if (data?.comment) collecte.comment = data.comment;
    if (data?.photos && Array.isArray(data.photos)) collecte.photos = data.photos;
    if (data?.type) collecte.type = data.type;
    if (data?.severity) collecte.severity = data.severity;

    await collecte.save();
    return collecte;
}

};
