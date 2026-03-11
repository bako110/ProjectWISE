const Pricing = require('../models/pricingAgency.js');

/**
 * Crée un nouveau tarif pour une agence
 */
const createPricing = async (agencyId, data) => {
    const pricing = new Pricing({ agencyId, ...data });
    return await pricing.save();
};

/**
 * Récupère tous les tarifs d'une agence
 */
const getAgencyPricings = async (agencyId) => {
    return await Pricing.find({ agencyId });
};

/**
 * Met à jour un tarif pour une agence
 */
const updatePricing = async (id, agencyId, data) => {
    return await Pricing.findOneAndUpdate({ _id: id, agencyId }, data, { new: true });
};

/**
 * Supprime un tarif pour une agence
 */
const deletePricing = async (id, agencyId) => {
    return await Pricing.findOneAndDelete({ _id: id, agencyId });
};

/**
 * Récupère un tarif par son ID
 */
const getPricingById = async (id) => {
    return await Pricing.findById(id);
};

module.exports = {
    createPricing,
    getAgencyPricings,
    updatePricing,
    deletePricing,
    getPricingById
};