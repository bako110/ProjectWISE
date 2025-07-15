import Zone from '../../models/Agency/zones.js';
import Agency from '../../models/Agency/Agency.js';

// Créer une nouvelle zone et l'associer à une agence
export const createZone = async (req, res) => {
  try {
    const {
      agencyId,
      name,
      location,
      polygonGeoJson,
      assignedCollectors = []
    } = req.body;

    // Vérifier que l'agence existe
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }

    // Créer la zone
    const zone = await Zone.create({
      agency: agencyId,
      name,
      location,
      polygonGeoJson,
      assignedCollectors,
    });

    // Ajouter la zone à l'agence
    agency.zones.push(zone._id);
    await agency.save();

    res.status(201).json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer toutes les zones d'une agence
export const getZonesByAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const zones = await Zone.find({ agency: agencyId }).populate('assignedCollectors', 'name phone');
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une zone par son ID
export const getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id).populate('assignedCollectors', 'name phone');
    if (!zone) return res.status(404).json({ error: 'Zone non trouvée' });
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une zone
export const updateZone = async (req, res) => {
  try {
    const zoneId = req.params.id;
    const updateData = req.body;

    const zone = await Zone.findByIdAndUpdate(zoneId, updateData, { new: true });
    if (!zone) return res.status(404).json({ error: 'Zone non trouvée' });

    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer une zone
export const deleteZone = async (req, res) => {
  try {
    const zoneId = req.params.id;

    // Supprimer la zone
    const zone = await Zone.findByIdAndDelete(zoneId);
    if (!zone) return res.status(404).json({ error: 'Zone non trouvée' });

    // Supprimer la référence dans l'agence
    await Agency.findByIdAndUpdate(zone.agency, { $pull: { zones: zoneId } });

    res.json({ message: 'Zone supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Affecter ou modifier les collecteurs affectés à une zone
export const assignCollectorsToZone = async (req, res) => {
  try {
    const zoneId = req.params.id;
    const { assignedCollectors } = req.body; // tableau d'IDs collecteurs

    const zone = await Zone.findByIdAndUpdate(
      zoneId,
      { assignedCollectors },
      { new: true }
    ).populate('assignedCollectors', 'name phone');

    if (!zone) return res.status(404).json({ error: 'Zone non trouvée' });

    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
