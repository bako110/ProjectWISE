const Collecte = require('../models/Collecte');

// Créer une nouvelle collecte
exports.createCollecte = async (data) => {
    const collecte = new Collecte(data);
    return await collecte.save();
}

// Récupérer les collectes par agence
exports.getCollectesByAgency = async (agencyId) => {
    return await Collecte.find({ agencyId });
}

// Mettre à jour le statut d'une collecte
exports.updateCollecteStatus = async (collecteId, status) => {
    return await Collecte.findByIdAndUpdate(collecteId, { status }, { new: true });
}

// Récupérer une collecte par ID
exports.getCollecteById = async (collecteId) => {
    return await Collecte.findById(collecteId);
}

// Supprimer une collecte
exports.deleteCollecte = async (collecteId) => {
    return await Collecte.findByIdAndDelete(collecteId);
}

// Récupérer les collectes par client
exports.getCollectesByClient = async (clientId) => {
    return await Collecte.find({ clientId });
}

// Récupérer les collectes par collecteur
exports.getCollectesByCollector = async (collectorId) => {
    return await Collecte.find({ collectorId });
}

// Récupérer toutes les collectes
exports.getAllCollectes = async () => {
    return await Collecte.find();
}
