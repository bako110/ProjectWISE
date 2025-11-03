const express = require('express');
const router = express.Router();
const AgencySearchController = require('../controllers/agencySearchSystem');

/**
 * @swagger
 * tags:
 *   name: Agency Search
 *   description: API de recherche unifiée d'agences avec critères détaillés
 */

/**
 * @swagger
 * /api/agencies/search/unified:
 *   get:
 *     summary: Recherche unifiée détaillée d'agences
 *     description: |
 *       Endpoint principal de recherche qui combine tous les critères :
 *       - Recherche par nom, quartier, zone d'activité, secteur, arrondissement, ville
 *       - Recherche géospatiale par coordonnées
 *       - Filtres avancés (propriétaire, nombre de gestionnaires)
 *       - Pagination et tri
 *     tags: [Agency Search]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:// Dans AgencySearchController - unifiedSearch()
async unifiedSearch(req, res) {
    try {
        const {
            name,
            neighborhood,
            activityZone,
            sector,
            arrondissement,
            city,
            latitude,
            longitude,
            radius = 10,
            hasOwner, // SUPPRIMER status
            minGestionnaires = 0,
            page = 1,
            limit = 10,
            getAll = false,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const result = await AgencySearchService.unifiedSearch({
            name: name || '',
            neighborhood: neighborhood || '',
            activityZone: activityZone || '',
            sector: sector || '',
            arrondissement: arrondissement || '',
            city: city || '',
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            radius: radius ? parseFloat(radius) : 10,
            hasOwner: hasOwner !== undefined ? 
                (hasOwner === 'true' || hasOwner === true) : null, // SUPPRIMER status
            minGestionnaires: minGestionnaires ? 
                parseInt(minGestionnaires) : 0,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            getAll: getAll === 'true' || getAll === true,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc'
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
 *           type: string
 *         description: Recherche par nom d'agence (contient aussi description et slogan)
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Recherche par quartier
 *       - in: query
 *         name: activityZone
 *         schema:
 *           type: string
 *         description: Recherche par zone d'activité
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Recherche par secteur d'activité
 *       - in: query
 *         name: arrondissement
 *         schema:
 *           type: string
 *         description: Recherche par arrondissement
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Recherche par ville
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
 *         description: Rayon de recherche en kilomètres (max 50)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *           default: active
 *         description: Statut des agences
 *       - in: query
 *         name: hasOwner
 *         schema:
 *           type: boolean
 *         description: Filtrer les agences avec/sans propriétaire
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt]
 *           default: createdAt
 *         description: Champ de tri
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
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
 *                 searchCriteria:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     neighborhood:
 *                       type: string
 *                     activityZone:
 *                       type: string
 *                     sector:
 *                       type: string
 *                     arrondissement:
 *                       type: string
 *                     city:
 *                       type: string
 *                     hasCoordinates:
 *                       type: boolean
 *                     radius:
 *                       type: number
 *                     status:
 *                       type: string
 *                     hasOwner:
 *                       type: boolean
 *                     minGestionnaires:
 *                       type: integer
 *       500:
 *         description: Erreur serveur
 */
router.get('/search/unified', AgencySearchController.unifiedSearch);

/**
 * @swagger
 * /api/agencies/search/advanced:
 *   get:
 *     summary: Recherche avancée avec scoring de pertinence
 *     description: |
 *       Recherche avancée avec scoring de pertinence pour les termes de recherche
 *       et recherche géospatiale intégrée
 *     tags: [Agency Search]
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Terme de recherche général pour la recherche en plein texte
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtre par nom exact
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Filtre par quartier
 *       - in: query
 *         name: activityZone
 *         schema:
 *           type: string
 *         description: Filtre par zone d'activité
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtre par secteur
 *       - in: query
 *         name: arrondissement
 *         schema:
 *           type: string
 *         description: Filtre par arrondissement
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtre par ville
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *           default: active
 *         description: Statut des agences
 *       - in: query
 *         name: hasOwner
 *         schema:
 *           type: boolean
 *         description: Filtrer les agences avec/sans propriétaire
 *       - in: query
 *         name: minGestionnaires
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Nombre minimum de gestionnaires
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, distance, name, createdAt]
 *           default: relevance
 *         description: Critère de tri
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Inclure les agences inactives
 *     responses:
 *       200:
 *         description: Recherche avancée effectuée avec succès
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
 *                 searchSummary:
 *                   type: object
 *                   properties:
 *                     term:
 *                       type: string
 *                     filters:
 *                       type: object
 *                     hasLocation:
 *                       type: boolean
 *                     sortBy:
 *                       type: string
 *       500:
 *         description: Erreur serveur
 */
router.get('/search/advanced', AgencySearchController.advancedSearch);

/**
 * @swagger
 * /api/agencies/search/metadata:
 *   get:
 *     summary: Récupérer les métadonnées de recherche
 *     description: |
 *       Retourne les suggestions de recherche et les statistiques pour les filtres
 *       Utile pour peupler les interfaces de recherche
 *     tags: [Agency Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Terme de recherche pour les suggestions (min 2 caractères)
 *     responses:
 *       200:
 *         description: Métadonnées récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           neighborhood:
 *                             type: string
 *                           city:
 *                             type: string
 *                           activityZone:
 *                             type: string
 *                           sector:
 *                             type: string
 *                           arrondissement:
 *                             type: string
 *                           type:
 *                             type: string
 *                     filters:
 *                       type: object
 *                       properties:
 *                         cities:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               count:
 *                                 type: integer
 *                         neighborhoods:
 *                           type: array
 *                         activityZones:
 *                           type: array
 *                         sectors:
 *                           type: array
 *                         arrondissements:
 *                           type: array
 *       400:
 *         description: Paramètre query trop court
 *       500:
 *         description: Erreur serveur
 */
router.get('/search/metadata', AgencySearchController.getSearchMetadata);

module.exports = router;