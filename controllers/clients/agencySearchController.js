import Agency from '../../models/Agency/Agency.js';

// ===== CONSTANTES =====
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

// ===== CONTRÔLEURS =====

/**
 * Recherche simple d'agences par nom et localisation
 */
export const rechercherAgences = async (req, res) => {
  try {
    const { q, limit = DEFAULT_LIMIT, page = DEFAULT_PAGE } = req.query;
    
    const searchTerm = q ? q.trim() : '';
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    // Si pas de terme de recherche, retourner toutes les agences (sans filtre sur status)
    let matchQuery = {};
    
    // Si terme de recherche fourni, rechercher dans tous les champs
    if (searchTerm) {
      matchQuery = {
        $or: [
          { name: new RegExp(searchTerm, 'i') },
          { 'location.region': new RegExp(searchTerm, 'i') },
          { 'location.province': new RegExp(searchTerm, 'i') },
          { 'location.commune': new RegExp(searchTerm, 'i') },
          { 'location.ville': new RegExp(searchTerm, 'i') },
          { 'location.quartier': new RegExp(searchTerm, 'i') },
          { 'location.secteur': new RegExp(searchTerm, 'i') },
          { 'location.rue': new RegExp(searchTerm, 'i') },
          { description: new RegExp(searchTerm, 'i') }
        ]
      };
    }

    // Pipeline d'agrégation avec lookup des zones
    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'zones',
          localField: 'zones',
          foreignField: '_id',
          as: 'zoneDetails'
        }
      },
      { $unwind: { path: '$zoneDetails', preserveNullAndEmptyArrays: true } },
      { $sort: { verified: -1, name: 1 } },
      { $skip: skip },
      { $limit: limitNum }
    ];

    // Exécution de la recherche
    const agencies = await Agency.aggregate(pipeline);

    // Comptage du total
    const totalPipeline = [
      { $match: matchQuery },
      { $count: 'total' }
    ];
    const countResults = await Agency.aggregate(totalPipeline);
    const total = countResults.length > 0 ? countResults[0].total : 0;

    res.status(200).json({
      results: agencies,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      query: searchTerm
    });

  } catch (error) {
    console.error('Erreur recherche agence:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche',
      message: error.message
    });
  }
};

/**
 * Suggestions pour l'autocomplétion
 */
export const getSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(200).json([]);
    }

    const term = q.trim();
    const limitNum = parseInt(limit);

    // Recherche dans les agences sans filtre status
    const agencies = await Agency.find({
      name: new RegExp(term, 'i')
    })
      .select('name location verified')
      .sort({ verified: -1, name: 1 })
      .limit(limitNum)
      .lean();

    // Formatage des suggestions
    const suggestions = agencies.map(agency => ({
      id: agency._id,
      text: agency.name,
      type: 'agency',
      verified: agency.verified || false,
      location: agency.location
    }));

    res.status(200).json(suggestions);

  } catch (error) {
    console.error('Erreur suggestions:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};


export const filterByVille = async (req, res) => {
  try {
    const { ville, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;
    if (!ville) return res.status(400).json({ error: 'Le paramètre ville est requis.' });

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const agencies = await Agency.find({ 'address.city': new RegExp(ville, 'i') })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Agency.countDocuments({ 'address.city': new RegExp(ville, 'i') });

    res.status(200).json({
      results: agencies,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      ville
    });
  } catch (error) {
    console.error('Erreur filtre par ville:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// =========================
// Rechercher par service
// =========================
export const filterByService = async (req, res) => {
  try {
    const { service, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;
    if (!service) return res.status(400).json({ error: 'Le paramètre service est requis.' });

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const agencies = await Agency.find({ services: service })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Agency.countDocuments({ services: service });

    res.status(200).json({
      results: agencies,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      service
    });
  } catch (error) {
    console.error('Erreur filtre par service:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

// =========================
// Rechercher par note
// =========================
export const filterByNote = async (req, res) => {
  try {
    const { noteMin = 0, noteMax = 5, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const agencies = await Agency.find({ rating: { $gte: parseFloat(noteMin), $lte: parseFloat(noteMax) } })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Agency.countDocuments({ rating: { $gte: parseFloat(noteMin), $lte: parseFloat(noteMax) } });

    res.status(200).json({
      results: agencies,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      noteMin,
      noteMax
    });
  } catch (error) {
    console.error('Erreur filtre par note:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};
