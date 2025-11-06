import * as pricingService from '../services/pricingAgency.js';

/**
 * Créer un tarif
 */
export const createPricingController = async (req, res) => {
    try {
        const { agencyId, ...pricingData } = req.body;

        if (!agencyId) {
            return res.status(400).json({ message: 'L’ID de l’agence est requis' });
        }

        const pricing = await pricingService.createPricing(agencyId, pricingData);
        res.status(201).json({ success: true, data: pricing });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Récupérer tous les tarifs d’une agence
 */
export const getPricingsController = async (req, res) => {
    try {
        const { agencyId } = req.body;

        if (!agencyId) {
            return res.status(400).json({ message: 'L’ID de l’agence est requis' });
        }

        const pricings = await pricingService.getAgencyPricings(agencyId);
        res.status(200).json({ success: true, data: pricings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Mettre à jour un tarif
 */
export const updatePricingController = async (req, res) => {
    try {
        const { agencyId } = req.body;

        if (!agencyId) {
            return res.status(400).json({ message: 'L’ID de l’agence est requis' });
        }

        const updatedPricing = await pricingService.updatePricing(
            req.params.id,
            agencyId,
            req.body
        );

        if (!updatedPricing) {
            return res.status(404).json({ success: false, message: 'Pricing non trouvé' });
        }

        res.status(200).json({ success: true, data: updatedPricing });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Supprimer un tarif
 */
export const deletePricingController = async (req, res) => {
    try {
        const { agencyId } = req.body;

        if (!agencyId) {
            return res.status(400).json({ message: 'L’ID de l’agence est requis' });
        }

        const deletedPricing = await pricingService.deletePricing(req.params.id, agencyId);

        if (!deletedPricing) {
            return res.status(404).json({ success: false, message: 'Pricing non trouvé' });
        }

        res.status(200).json({ success: true, message: 'Pricing supprimé avec succès' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
