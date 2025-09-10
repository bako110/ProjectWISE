import City from "../../models/Adresse/City.js";
import {paginate} from "../../utils/pagination.js";


export async function createCity (req, res) {
    try {
        const { name,arrondissements } = req.body;
        if (!name && !arrondissements) {
            return res.status(400).json({ message: "Le nom du City est requis." });
        }
        const city = new City({ name, arrondissements });
        await city.save();
        res.status(201).json(city);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Un City avec ce nom existe déjà." });
        }
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export async function updateCity (req, res) {
    try {
        const { id } = req.params;
        const { name, arrondissements } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Le nom du City est requis." });
        }
        const city = await City.findByIdAndUpdate(id, { name, arrondissements }, { new: true });
        if (!city) {
            return res.status(404).json({ message: "City non trouvé." });
        }
        res.status(200).json(city);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Un City avec ce nom existe déjà." });
        }
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
export async function removeCity (req, res) {
    try {
        const { id } = req.params;
        const city = await City.findByIdAndDelete(id);
        if (!city) {
            return res.status(404).json({ message: "City non trouvé." });
        }
        res.status(200).json({ message: "City supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }   
};
export async function getCityById (req, res) {
    try {
        const { id } = req.params;
        const city = await City.findById(id);
        if (!city) {
            return res.status(404).json({ message: "City non trouvé." });
        }
        res.status(200).json(city);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

export async function listCity (req, res) {
    try {
        const citys = await paginate(City, req )

        res.status(200).json(citys);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};