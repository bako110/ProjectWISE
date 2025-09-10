import Neighborhood from "../../models/Adresse/Neighborhood.js";
import {paginate} from "../../utils/pagination.js";


export async function createNeighborhood (req, res) {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Le nom du quartier est requis." });
        }
        const neighborhood = new Neighborhood({ name });
        await neighborhood.save();
        res.status(201).json(neighborhood);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Un quartier avec ce nom existe déjà." });
        }
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export async function updateNeighborhood (req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Le nom du quartier est requis." });
        }
        const neighborhood = await Neighborhood.findByIdAndUpdate(id, { name }, { new: true });
        if (!neighborhood) {
            return res.status(404).json({ message: "Quartier non trouvé." });
        }
        res.status(200).json(neighborhood);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Un quartier avec ce nom existe déjà." });
        }
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
export async function removeNeighborhood (req, res) {
    try {
        const { id } = req.params;
        const neighborhood = await Neighborhood.findByIdAndDelete(id);
        if (!neighborhood) {
            return res.status(404).json({ message: "Quartier non trouvé." });
        }
        res.status(200).json({ message: "Quartier supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }   
};
export async function getNeighborhoodById (req, res) {
    try {
        const { id } = req.params;
        const neighborhood = await Neighborhood.findById(id);
        if (!neighborhood) {
            return res.status(404).json({ message: "Quartier non trouvé." });
        }
        res.status(200).json(neighborhood);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export async function listNeighborhood (req, res) {
    try {
        const neighborhoods = await paginate(Neighborhood, req )

        res.status(200).json(neighborhoods);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};