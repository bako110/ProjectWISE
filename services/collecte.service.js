const Collecte = require('../models/Collecte');
const mongoose = require('mongoose');

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
        return await Collecte.find({ clientId: userId, status: 'Collected' }).sort({ date: -1 });
    },

    async UserReportingHistory(userId) {
        if (!userId) throw new Error('User ID is required');
        return await Collecte.find({ clientId: userId, status: 'Reported' }).sort({ date: -1 });
    },

    async UserScheduledCollectes(userId) {
        if (!userId) throw new Error('User ID is required');
        return await Collecte.find({ clientId: userId, status: 'Scheduled' }).sort({ date: -1 });
    },

    /** 🔹 AGENCE */
    async AgencyCollectes(agencyId) {
        if (!agencyId) throw new Error('Agency ID is required');
        return await Collecte.find({ agencyId, status: 'Scheduled' }).sort({ date: -1 });
    },

    async AgencyCompletedCollectes(agencyId) {
        if (!agencyId) throw new Error('Agency ID is required');
        return await Collecte.find({ agencyId, status: 'Collected' }).sort({ date: -1 });
    },

    async AgencyReportingCollectes(agencyId) {
        if (!agencyId) throw new Error('Agency ID is required');
        return await Collecte.find({ agencyId, status: 'Reported' }).sort({ date: -1 });
    },

    /** 🔹 COLLECTEUR */
    async CollectorCollectes(collectorId) {
        if (!collectorId) throw new Error('Collector ID is required');
        return await Collecte.find({ collectorId, status: 'Scheduled' }).sort({ date: -1 });
    },

    async CollectorCompletedCollectes(collectorId) {
        if (!collectorId) throw new Error('Collector ID is required');
        return await Collecte.find({ collectorId, status: 'Collected' }).sort({ date: -1 });
    },

    async CollectorReportingCollectes(collectorId) {
        if (!collectorId) throw new Error('Collector ID is required');
        return await Collecte.find({ collectorId, status: 'Reported' }).sort({ date: -1 });
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
    collecte.reportedBy = reporterId; // Nouvel attribut pour savoir qui a signalé

    if (data && data.comment) collecte.comment = data.comment;
    if (data && Array.isArray(data.photos)) collecte.photos = data.photos;

    await collecte.save();
    return collecte;
}


};
