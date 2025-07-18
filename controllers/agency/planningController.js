import Planning from '../../models/Agency/WasteService.js';

// Créer un planning
export const creerPlanning = async (req, res) => {
  try {
    const { date, heure, zone, collecteur } = req.body;
    if (!date || !heure || !zone || !collecteur) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }
    const planning = new Planning({ date, heure, zone, collecteur });
    await planning.save();
    res.status(201).json(planning);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lister plannings (avec filtres)
export const listerPlannings = async (req, res) => {
  try {
    const { collecteur, zone, date } = req.query;
    const filtre = {};
    if (collecteur) filtre.collecteur = collecteur;
    if (zone) filtre.zone = zone;
    if (date) filtre.date = new Date(date);

    const plannings = await Planning.find(filtre)
      .populate('zone', 'name')
      .populate('collecteur', 'name phone');
    res.json(plannings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un planning (ex: marquer collecte effectuée)
export const mettreAJourPlanning = async (req, res) => {
  try {
    const planning = await Planning.findById(req.params.id);
    if (!planning) return res.status(404).json({ error: 'Planning non trouvé' });

    const { statut, commentaire, photos, positionGPS } = req.body;
    if (statut) planning.statut = statut;
    if (commentaire) planning.commentaire = commentaire;
    if (photos) planning.photos = photos;
    if (positionGPS) planning.positionGPS = positionGPS;
    if (statut === 'effectué') planning.dateEffectuee = new Date();

    await planning.save();
    res.json(planning);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Historique des tournées d'un collecteur
export const historiqueParCollecteur = async (req, res) => {
  try {
    const plannings = await Planning.find({ collecteur: req.params.collecteurId })
      .sort({ date: -1 })
      .populate('zone', 'name')
      .populate('collecteur', 'name');
    res.json(plannings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
