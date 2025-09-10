import Sector from "../../models/Adresse/Sector.js";
import {paginate} from "../../utils/pagination.js";

export async function createSector (req, res) {
    try{
        const {name, neighborhoods} = req.body;
        if(!name && !neighborhoods){
            return res.satutus(400).json({message: "Veuillez entre les informations"})
        }
        const sector = new Sector({name, neighborhoods});
        await sector.save();

        res.status(201).json(sector)
    }catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Un secteur avec ce nom existe déjà." });
        }
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}

export async function updateSector(req, res) {
    try {
        const {id} = req.params;
        const {name, neighborhoods} = req.body;

        const sector = await Sector.findByIdAndUpdate(id, {name, neighborhoods}, {new:True} );
        if (!sector){
            return res.status(404).json('le secteur n\'existe pas')
        }
        res.status(200).json(sector)
    }catch(error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Un secteur avec ce nom existe déjà." });
        }
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}

export async function removeSector(req, res){
    try{
        const {id} = req.params;
        const sector = await Sector.findByIdAndDelete(id);
        if(!sector) {
            return res.satutus(404).json({message:"secteur non trouvé"})
        }
        res.status(200).json({message:"secteur supprimé"})
    }catch (error){
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}

export async function getSectorById (req, res) {
    try{
        const {id} = req.params;

        const sector = Sector.findById(id);
        if(!sector){
            return res.status(404).json({message:"secteur non trouve"});

        }
        res.status(200).json(sector)
    }catch(error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}

export async function getSectors (req, res) {
    try {
        const sector = await paginate(Sector, req)
        res.status(200).json(sector)
    }catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}