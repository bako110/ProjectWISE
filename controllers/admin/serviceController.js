import Service from "../../models/Agency/Service.js";

export const createService = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    if (!name || !description || !type) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const service = new Service({ name, description, type });
    await service.save();

    res.status(201).json({
      message: "Le service a été bien créée avec succès",
      service
    });
  } catch (error) {
    console.error("Erreur lors de la création de la zone de service :", error);
    res.status(500).json({ error: error.message });
  }
}

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type } = req.body;

    if (!name || !description || !type) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const service = await Service.findByIdAndUpdate(id, { name, description, type }, { new: true });
    if (!service) {
      return res.status(404).json({ error: "Service non trouvée" });
    }

    res.status(200).json({
      message: "Le service a été mise à jour avec succès",
      service
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du service :", error);
    res.status(500).json({ error: error.message });
  }
}

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ error: "Service non trouvée" });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error("Erreur lors de la récupération du service :", error);
    res.status(500).json({ error: error.message });
  }
}

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error("Erreur lors de la récupération des services :", error);
    res.status(500).json({ error: error.message });
  }
}

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({ error: "Service non trouvée" });
    }

    res.status(200).json({ message: "Service supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du service :", error);
    res.status(500).json({ error: error.message });
  }
}