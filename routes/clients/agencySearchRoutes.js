import express from 'express';
import { 
  rechercherAgences, 
  getSuggestions, 
  filterByVille, 
  filterByService, 
  filterByNote 
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
 * /api/agences/ville:
 *   get:
 *     summary: Filtrer les agences par ville
 *     tags: [RechercheAgences]
 *     parameters:
 *       - in: query
 *         name: ville
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Liste des agences correspondant à la ville
 */

/**
 * @swagger
 * /api/agences/service:
 *   get:
 *     summary: Filtrer les agences par service
 *     tags: [RechercheAgences]
 *     parameters:
 *       - in: query
 *         name: service
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Liste des agences correspondant au service
 */

/**
 * @swagger
 * /api/agences/note:
 *   get:
 *     summary: Filtrer les agences par note minimale et maximale
 *     tags: [RechercheAgences]
 *     parameters:
 *       - in: query
 *         name: noteMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: noteMax
 *         schema:
 *           type: number
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
 *     responses:
 *       200:
 *         description: Liste des agences correspondant aux critères de note
 */

// ----------------------- ROUTES -----------------------

// GET /api/agences/search?q=terme&page=1&limit=10&lat=12.3714&lng=-1.5197&radius=5
router.get('/search', rechercherAgences);

// GET /api/agences/suggestions?q=terme&limit=5
router.get('/suggestions', getSuggestions);

// GET /api/agences/ville?ville=Ouagadougou&page=1&limit=10
router.get('/city', filterByVille);

// GET /api/agences/service?service=Livraison&page=1&limit=10
router.get('/service', filterByService);

// GET /api/agences/note?noteMin=3&noteMax=5&page=1&limit=10
router.get('/note', filterByNote);

export default router;
