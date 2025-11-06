import Pricing from '../models/pricingAgency.js';

/**
 * Crée un nouveau tarif pour une agence
 */
export const createPricing = async (agencyId, data) => {
    const pricing = new Pricing({ agencyId, ...data });
    return await pricing.save();
};

/**
 * Récupère tous les tarifs d'une agence
 */
export const getAgencyPricings = async (agencyId) => {
    return await Pricing.find({ agencyId });
};

/**
 * Met à jour un tarif pour une agence
 */
export const updatePricing = async (id, agencyId, data) => {
    return await Pricing.findOneAndUpdate({ _id: id, agencyId }, data, { new: true });
};

/**
 * Supprime un tarif pour une agence
 */
export const deletePricing = async (id, agencyId) => {
    return await Pricing.findOneAndDelete({ _id: id, agencyId });
};
