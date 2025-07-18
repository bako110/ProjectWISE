import Agency from '../../models/Agency/Agency.js';
import ServiceZone from '../../models/Agency/ServiceZone.js';

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

/**
 * Recherche par zone
 */
export const rechercherParZone = async (req, res) => {
  try {
    const { zoneId, limit = DEFAULT_LIMIT, page = DEFAULT_PAGE } = req.query;

    if (!zoneId) {
      return res.status(400).json({
        error: 'Paramètre zoneId requis'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
      { $match: { zone: zoneId } }, // sans filtre status
      {
        $lookup: {
          from: 'zones',
          localField: 'zone',
          foreignField: '_id',
          as: 'zoneDetails'
        }
      },
      { $unwind: { path: '$zoneDetails', preserveNullAndEmptyArrays: true } },
      { $sort: { verified: -1, name: 1 } },
      { $skip: skip },
      { $limit: limitNum }
    ];

    const agencies = await Agency.aggregate(pipeline);

    const totalPipeline = [
      { $match: { zone: zoneId } }, // sans filtre status
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
      zone: { id: zoneId }
    });

  } catch (error) {
    console.error('Erreur recherche par zone:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};

/**
 * Liste des zones disponibles
 */
export const getZones = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    let query = {};
    if (q) {
      query = {
        $or: [
          { name: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') },
          { code: new RegExp(q, 'i') }
        ]
      };
    }

    const zones = await Zone.find(query)
      .select('name description code')
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json(zones);

  } catch (error) {
    console.error('Erreur récupération zones:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
