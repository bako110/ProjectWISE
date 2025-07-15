import express from 'express';
import { 
  rechercherAgences, 
  getSuggestions
} from '../../controllers/clients/agencySearchController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RechercheAgences
 *   description: Endpoints publics de recherche et suggestion d’agences
 */

/**
 * @swagger
 * /api/agences/search:
 *   get:
 *     summary: Recherche multi‑critères d’agences (nom + localisation + géo)
 *     tags: [RechercheAgences]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme recherché (nom d’agence, quartier, rue, etc.)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude pour suggestions géographiques
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude pour suggestions géographiques
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: Rayon en km pour suggestions alentours
 *     responses:
 *       200:
 *         description: Résultats de la recherche + suggestions
 *       400:
 *         description: Paramètre manquant ou invalide
 */

/**
 * @swagger
 * /api/agences/suggestions:
 *   get:
 *     summary: Suggestions d’autocomplétion pour le champ de recherche
 *     tags: [RechercheAgences]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme saisi par l’utilisateur
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Liste courte de suggestions (agences ou lieux)
 *       400:
 *         description: Paramètre manquant
 */

/**
 * @swagger
 * /api/agences/location:
 *   get:
 *     summary: Filtrer les agences par localisation précise (région → secteur)
 *     tags: [RechercheAgences]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *       - in: query
 *         name: commune
 *         schema:
 *           type: string
 *       - in: query
 *         name: ville
 *         schema:
 *           type: string
 *       - in: query
 *         name: quartier
 *         schema:
 *           type: string
 *       - in: query
 *         name: secteur
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste des agences correspondant aux filtres
 *       400:
 *         description: Paramètre invalide
 */

// ----------------------- ROUTES -----------------------

// GET /api/agences/search?q=terme&page=1&limit=10&lat=12.3714&lng=-1.5197&radius=5
router.get('/search', rechercherAgences);

// GET /api/agences/suggestions?q=terme&limit=5
router.get('/suggestions', getSuggestions);

// GET /api/agences/location?region=Centre&ville=Ouagadougou&quartier=Cissin
// router.get('/location', rechercherParLocalisation);

export default router;
