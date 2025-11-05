const express = require('express');
const router = express.Router();
const AgencySearchController = require('../controllers/agencySearchController'); // Correction du nom

/**
 * @swagger
 * tags:
 *   name: Agency Search
 *   description: API de recherche unifiée et dynamique d'agences
 */

/**
 * @swagger
 * /api/search/agencies/unified:
 *   get:
 *     summary: Recherche unifiée dynamique d'agences
 *     description: |
 *       Endpoint principal qui combine recherche classique + recherche hiérarchique + filtres dynamiques
 *       - Recherche hiérarchique automatique (ville → arrondissement → secteur → quartier)
 *       - Retourne les filtres disponibles pour l'interface utilisateur
 *       - Compatible avec tous les types de recherche
 *     tags: [Agency Search]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Recherche par nom d'agence
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Ville de recherche (déclenche la recherche hiérarchique)
 *       - in: query
 *         name: arrondissement
 *         schema:
 *           type: string
 *         description: Arrondissement (nécessite une ville)
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Secteur (nécessite un arrondissement)
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Quartier (nécessite un secteur)
 *       - in: query
 *         name: activityZone
 *         schema:
 *           type: string
 *         description: Zone d'activité
 *       - in: query
 *         name: includeAvailableFilters
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Inclure les filtres disponibles dans la réponse
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude pour recherche géospatiale
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude pour recherche géospatiale
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: active
 *         description: |
 *           Statut des agences :
 *           - active : Agences actives seulement
 *           - inactive : Agences inactives seulement  
 *           - all : Toutes les agences (actives et inactives)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Recherche effectuée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agency'
 *                 total:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 searchContext:
 *                   type: object
 *                   properties:
 *                     filtersUsed:
 *                       type: object
 *                     availableFilters:
 *                       type: object
 *                     hierarchicalPath:
 *                       type: object
 */
router.get('/unified', AgencySearchController.unifiedSearch);

/**
 * @swagger
 * /api/search/agencies/metadata:
 *   get:
 *     summary: Métadonnées de recherche et filtres disponibles
 *     description: |
 *       Retourne soit les suggestions de recherche, soit les filtres disponibles selon les paramètres
 *       - Sans paramètres → suggestions classiques
 *       - Avec city/arrondissement/sector → filtres disponibles pour la hiérarchie
 *     tags: [Agency Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Terme de recherche pour les suggestions
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Ville pour filtrer les arrondissements disponibles
 *       - in: query
 *         name: arrondissement
 *         schema:
 *           type: string
 *         description: Arrondissement pour filtrer les secteurs disponibles
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Secteur pour filtrer les quartiers disponibles
 *     responses:
 *       200:
 *         description: Métadonnées récupérées avec succès
 */
router.get('/metadata', AgencySearchController.getSearchMetadata);

module.exports = router;