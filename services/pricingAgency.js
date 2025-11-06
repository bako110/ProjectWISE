import Pricing from '../models/pricingAgency.js';

/**
 * Crée un nouveau tarif pour une agence
 * @param {String} agencyId - ID de l'agence
 * @param {Object} data - données du tarif (planType, price, description, numberOfPasses)
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
 * Met à jour un tarif
 */
export const updatePricing = async (pricingId, agencyId, data) => {
    return await Pricing.findOneAndUpdate(
        { _id: pricingId, agencyId },
        data,
        { new: true }
    );
};

/**
 * Supprime un tarif
 */
export const deletePricing = async (pricingId, agencyId) => {
    return await Pricing.findOneAndDelete({ _id: pricingId, agencyId });
};
