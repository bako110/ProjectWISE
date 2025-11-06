import Pricing from '../models/pricingAgency.js';

/**
 * Crée un nouveau tarif pour une agence
 */
export const createPricingController = async (req, res) => {
    try {
        const { agencyId, ...pricingData } = req.body;

        if (!agencyId) {
            return res.status(400).json({ success: false, message: "L'ID de l'agence est requis" });
        }

        const pricing = new Pricing({ agencyId, ...pricingData });
        await pricing.save();

        res.status(201).json({
            success: true,
            data: pricing,
            message: 'Tarif créé avec succès'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Récupère tous les tarifs d'une agence
 */
export const getPricingsController = async (req, res) => {
    try {
        const { agencyId } = req.body;

        if (!agencyId) {
            return res.status(400).json({ success: false, message: "L'ID de l'agence est requis" });
        }

        const pricings = await Pricing.find({ agencyId });
        res.status(200).json({ success: true, data: pricings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Met à jour un tarif pour une agence
 */
export const updatePricingController = async (req, res) => {
    try {
        const { agencyId, ...updateData } = req.body;
        const { id } = req.params;

        if (!agencyId) {
            return res.status(400).json({ success: false, message: "L'ID de l'agence est requis" });
        }

        const updatedPricing = await Pricing.findOneAndUpdate(
            { _id: id, agencyId },
            updateData,
            { new: true }
        );

        if (!updatedPricing) {
            return res.status(404).json({ success: false, message: 'Tarif non trouvé' });
        }

        res.status(200).json({
            success: true,
            data: updatedPricing,
            message: 'Tarif mis à jour avec succès'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Supprime un tarif pour une agence
 */
export const deletePricingController = async (req, res) => {
    try {
        const { agencyId } = req.body;
        const { id } = req.params;

        if (!agencyId) {
            return res.status(400).json({ success: false, message: "L'ID de l'agence est requis" });
        }

        const deletedPricing = await Pricing.findOneAndDelete({ _id: id, agencyId });

        if (!deletedPricing) {
            return res.status(404).json({ success: false, message: 'Tarif non trouvé' });
        }

        res.status(200).json({
            success: true,
            data: deletedPricing,
            message: 'Tarif supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
