import Arrondissementstatistics from "../../models/Adresse/Arrondissement.js";
import {paginate} from "../../utils/pagination.js";


export async function createArrondissement (req, res) {
    try {
        const { name,sectors } = req.body;
        if (!name && !sectors) {
            return res.status(400).json({ message: "Le nom du arrondissement est requis." });
        }
        const arrondissement = new Arrondissement({ name, sectors });
        await arrondissement.save();
        res.status(201).json(arrondissement);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Un arrondissement avec ce nom existe déjà." });
        }
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export async function updateArrondissement (req, res) {
    try {
        const { id } = req.params;
        const { name, sectors } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Le nom du arrondissement est requis." });
        }
        const arrondissement = await Arrondissement.findByIdAndUpdate(id, { name, sectors }, { new: true });
        if (!arrondissement) {
            return res.status(404).json({ message: "arrondissement non trouvé." });
        }
        res.status(200).json(arrondissement);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Un arrondissement avec ce nom existe déjà." });
        }
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
export async function removeArrondissement (req, res) {
    try {
        const { id } = req.params;
        const arrondissement = await Arrondissement.findByIdAndDelete(id);
        if (!arrondissement) {
            return res.status(404).json({ message: "arrondissement non trouvé." });
        }
        res.status(200).json({ message: "arrondissement supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }   
};
export async function getArrondissementById (req, res) {
    try {
        const { id } = req.params;
        const arrondissement = await Arrondissement.findById(id);
        if (!arrondissement) {
            return res.status(404).json({ message: "arrondissement non trouvé." });
        }
        res.status(200).json(arrondissement);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export async function listArrondissement (req, res) {
    try {
        const arrondissements = await paginate(Arrondissement, req )

        res.status(200).json(arrondissements);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};