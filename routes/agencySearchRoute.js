const express = require('express');
const router = express.Router();
const AgencySearchController = require('../controllers/agencySearchSystem');

/**
 * @swagger
 * tags:
 *   name: Agency Search
 *   description: API de recherche avancée d'agences
 */

/**
 * @swagger
 * /api/agencies/search:
 *   get:
 *     summary: Recherche avancée d'agences
 *     tags: [Agency Search]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche général
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Ville de l'agence
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Quartier de l'agence
 *       - in: query
 *         name: zoneActivite
 *         schema:
 *           type: string
 *         description: Zone d'activité
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *           default: active
 *         description: Statut de l'agence
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: getAll
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Récupérer tous les résultats sans pagination
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude pour recherche géospatiale
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude pour recherche géospatiale
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           format: float
 *           default: 10
 *         description: Rayon de recherche en kilomètres
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
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Erreur serveur
 */
router.get('/search', AgencySearchController.searchAgencies);

/**
 * @swagger
 * /api/agencies/search/fulltext:
 *   get:
 *     summary: Recherche en plein texte avec scoring de pertinence
 *     tags: [Agency Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Requête de recherche en plein texte
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtre par ville
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Filtre par quartier
 *       - in: query
 *         name: zoneActivite
 *         schema:
 *           type: string
 *         description: Filtre par zone d'activité
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *           default: active
 *         description: Statut de l'agence
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Recherche en plein texte effectuée avec succès
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
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Erreur serveur
 */
router.get('/search/fulltext', AgencySearchController.fullTextSearch);

/**
 * @swagger
 * /api/agencies/search/geo:
 *   get:
 *     summary: Recherche géospatiale avancée
 *     tags: [Agency Search]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           format: float
 *         required: true
 *         description: Latitude du point de référence
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           format: float
 *         required: true
 *         description: Longitude du point de référence
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           format: float
 *           default: 10
 *         description: Rayon de recherche en kilomètres
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche additionnel
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtre par ville
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Filtre par quartier
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *           default: active
 *         description: Statut de l'agence
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Recherche géospatiale effectuée avec succès
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
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Paramètres manquants ou invalides
 *       500:
 *         description: Erreur serveur
 */
router.get('/search/geo', AgencySearchController.geoSearch);

/**
 * @swagger
 * /api/agencies/search/filters:
 *   get:
 *     summary: Recherche par filtres multiples
 *     tags: [Agency Search]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche général
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Ville de l'agence
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Quartier de l'agence
 *       - in: query
 *         name: zoneActivite
 *         schema:
 *           type: string
 *         description: Zone d'activité
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *           default: active
 *         description: Statut de l'agence
 *       - in: query
 *         name: hasOwner
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filtrer les agences avec propriétaire
 *       - in: query
 *         name: minGestionnaires
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Nombre minimum de gestionnaires
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: getAll
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Récupérer tous les résultats sans pagination
 *     responses:
 *       200:
 *         description: Recherche par filtres effectuée avec succès
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
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Erreur serveur
 */
router.get('/search/filters', AgencySearchController.searchByMultipleFilters);

/**
 * @swagger
 * /api/agencies/search/suggestions:
 *   get:
 *     summary: Récupérer les suggestions de recherche
 *     tags: [Agency Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Terme de recherche pour les suggestions
 *     responses:
 *       200:
 *         description: Suggestions récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       city:
 *                         type: string
 *                       neighborhood:
 *                         type: string
 *                       zoneActivite:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [name, city, neighborhood, zoneActivite]
 *       400:
 *         description: Paramètre query manquant ou trop court
 *       500:
 *         description: Erreur serveur
 */
router.get('/search/suggestions', AgencySearchController.getSearchSuggestions);

module.exports = router;