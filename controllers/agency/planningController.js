import CollectionSchedule from '../../models/Agency/CollectionSchedule.js';

// ➤ Créer un planning
export const creerPlanning = async (req, res) => {
  try {
    const { zoneId, dayOfWeek, startTime, endTime, collectorId } = req.body;

    if (!zoneId || typeof dayOfWeek !== 'number' || !startTime || !endTime || !collectorId) {
      return res.status(400).json({ error: "Champs obligatoires manquants ou invalides" });
    }

    const planning = new CollectionSchedule({
      zoneId,
      dayOfWeek,
      startTime,
      endTime,
      collectorId
    });

    await planning.save();

    res.status(201).json({
      message: "Planning créé avec succès",
      planning
    });
  } catch (error) {
    console.error("Erreur lors de la création du planning :", error);
    res.status(500).json({ error: error.message });
  }
};

// ➤ Lister les plannings (avec filtres)
export const listerPlannings = async (req, res) => {
  try {
    const { collectorId, zoneId, dayOfWeek } = req.query;
    const filtre = {};

    if (collectorId) filtre.collectorId = collectorId;
    if (zoneId) filtre.zoneId = zoneId;
    if (dayOfWeek) filtre.dayOfWeek = parseInt(dayOfWeek);

    const plannings = await CollectionSchedule.find(filtre)
      .populate('zoneId', 'name')
      .populate('collectorId', 'firstName lastName phone');

    res.json(plannings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Mettre à jour un planning
export const mettreAJourPlanning = async (req, res) => {
  try {
    const planning = await CollectionSchedule.findById(req.params.id);
    if (!planning) return res.status(404).json({ error: 'Planning non trouvé' });

    const { startTime, endTime, collectorId, isActive } = req.body;

    if (startTime) planning.startTime = startTime;
    if (endTime) planning.endTime = endTime;
    if (collectorId) planning.collectorId = collectorId;
    if (typeof isActive === 'boolean') planning.isActive = isActive;

    await planning.save();
    res.json({
      message: 'Planning mis à jour',
      planning
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Historique des tournées d’un collecteur
export const historiqueParCollecteur = async (req, res) => {
  try {
    const { collectorId } = req.params;

    const plannings = await CollectionSchedule.find({ collectorId })
      .sort({ createdAt: -1 })
      .populate('zoneId', 'name')
      .populate('collectorId', 'firstName lastName');

    res.json(plannings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const supprimerPlanning = async (req, res) => {
  try {
    const planning = await CollectionSchedule.findByIdAndDelete(req.params.id);
    if (!planning) return res.status(404).json({ error: 'Planning non trouvé' });

    res.json({ data: planning, message: 'Planning supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}