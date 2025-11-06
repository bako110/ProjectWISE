import * as pricingService from '../services/pricingAgency.js';

/**
 * Créer un tarif
 */
export const createPricingController = async (req, res) => {
    try {
        const agencyId = req.user.id; // supposons que tu as middleware auth
        const pricing = await pricingService.createPricing(agencyId, req.body);
        res.status(201).json(pricing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Récupérer tous les tarifs d'une agence
 */
export const getPricingsController = async (req, res) => {
    try {
        const agencyId = req.user.id;
        const pricings = await pricingService.getAgencyPricings(agencyId);
        res.status(200).json(pricings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Mettre à jour un tarif
 */
export const updatePricingController = async (req, res) => {
    try {
        const agencyId = req.user.id;
        const updatedPricing = await pricingService.updatePricing(
            req.params.id,
            agencyId,
            req.body
        );
        if (!updatedPricing) return res.status(404).json({ message: 'Pricing not found' });
        res.status(200).json(updatedPricing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Supprimer un tarif
 */
export const deletePricingController = async (req, res) => {
    try {
        const agencyId = req.user.id;
        const deletedPricing = await pricingService.deletePricing(req.params.id, agencyId);
        if (!deletedPricing) return res.status(404).json({ message: 'Pricing not found' });
        res.status(200).json({ message: 'Pricing deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
