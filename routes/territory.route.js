const express = require('express');
const router = express.Router();
const TerritoryController = require('../controllers/territory.controller');
const authMiddleware = require('../middlewares/auth.js');

/**
 * @swagger
 * tags:
 *   name: Territories
 *   description: API pour gérer les territoires
 */

/**
 * @swagger
 * /api/territories/cities:
 *   post:
 *     summary: Créer une ville
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/City'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/City'
 *       400:
 *         description: Erreur de validation ou données manquantes
 *       500:
 *         description: Erreur interne du serveur
 *
 *   get:
 *     summary: Récupérer toutes les villes
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/City'
 *       500:
 *         description: Erreur interne du serveur
 */
/**
 * @swagger
 * /api/territories/many/cities:
 *   post:
 *     summary: Créer plusieurs villes
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/City'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/City'
 *       400:
 *         description: Erreur de validation ou données manquantes
 *       500:
 *         description: Erreur interne du serveur
 */

/**
 * @swagger
 * /api/territories/cities/{id}:
 *   get:
 *     summary: Récupérer une ville par ID
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ville
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/City'
 *       404:
 *         description: Ville non trouvée
 *       500:
 *         description: Erreur interne du serveur
 *
 *   put:
 *     summary: Mettre à jour une ville par ID
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ville
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/City'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/City'
 *       400:
 *         description: Erreur de validation ou données manquantes
 *       404:
 *         description: Ville non trouvée
 *       500:
 *         description: Erreur interne du serveur
 *
 *   delete:
 *     summary: Supprimer une ville par ID
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ville
 *     responses:
 *       200:
 *         description: Ville supprimée avec succès
 *       404:
 *         description: Ville non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/cities', authMiddleware(), TerritoryController.createCity);
router.get('/cities', authMiddleware(), TerritoryController.getCities);
router.post('/many/cities', authMiddleware(), TerritoryController.createManyCities);
router.get('/cities/:id', authMiddleware(), TerritoryController.getCity);
router.put('/cities/:id', authMiddleware(), TerritoryController.updateCity);
router.delete('/cities/:id', authMiddleware(), TerritoryController.deleteCity);


/**
 * @swagger
 * /api/territories/arrondissements:
 *   post:
 *     summary: Créer un arrondissement
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Arrondissement'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Arrondissement'
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur interne du serveur
 *
 *   get:
 *     summary: Récupérer tous les arrondissements
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Arrondissement'
 *       500:
 *         description: Erreur interne du serveur
 */

/**
 * @swagger
 * /api/territories/many/arrondissements:
 *  post:
 *    summary: Créer plusieurs arrondissements
 *    tags: [Territories]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Arrondissement'
 *    responses:
 *      201:
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Arrondissement'
 *      400:
 *        description: Erreur de validation
 *      500:
 *        description: Erreur interne du serveur
 */

/**
 * @swagger
 * /api/territories/arrondissements/{id}:
 *   get:
 *     summary: Récupérer un arrondissement par ID
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'arrondissement
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Arrondissement'
 *       404:
 *         description: Arrondissement non trouvé
 *
 *   put:
 *     summary: Mettre à jour un arrondissement
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Arrondissement'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Arrondissement'
 *       404:
 *         description: Arrondissement non trouvé
 *
 *   delete:
 *     summary: Supprimer un arrondissement
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arrondissement supprimé
 *       404:
 *         description: Arrondissement non trouvé
 */
router.post('/arrondissements', authMiddleware(), TerritoryController.createArrondissement);
router.get('/arrondissements', authMiddleware(), TerritoryController.getArrondissements);
router.post('/many/arrondissements', authMiddleware(), TerritoryController.createManyArrondissements);
router.get('/arrondissements/:id', authMiddleware(), TerritoryController.getArrondissement);
router.put('/arrondissements/:id', authMiddleware(), TerritoryController.updateArrondissement);
router.delete('/arrondissements/:id', authMiddleware(), TerritoryController.deleteArrondissement);

/**
 * @swagger
 * /api/territories/sectors:
 *   post:
 *     summary: Créer un secteur
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sector'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sector'
 *
 *   get:
 *     summary: Récupérer tous les secteurs
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sector'
 */

/**
 * @swagger
 * /api/territories/many/sectors:
 *   post:
 *     summary: Créer plusieurs secteurs
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Sector'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sector'
 *       400:
 *         description: Erreur de validation ou données manquantes
 *       500:
 *         description: Erreur interne du serveur
 */


/**
 * @swagger
 * /api/territories/sectors/{id}:
 *   get:
 *     summary: Récupérer un secteur par ID
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sector'
 *       404:
 *         description: Secteur non trouvé
 *
 *   put:
 *     summary: Mettre à jour un secteur
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sector'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sector'
 *
 *   delete:
 *     summary: Supprimer un secteur
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Secteur supprimé
 */
router.post('/sectors', authMiddleware(), TerritoryController.createSector);
router.get('/sectors', authMiddleware(), TerritoryController.getSectors);
router.post('/many/sectors', authMiddleware(), TerritoryController.createManySectors);
router.get('/sectors/:id', authMiddleware(), TerritoryController.getSector);
router.put('/sectors/:id', authMiddleware(), TerritoryController.updateSector);
router.delete('/sectors/:id', authMiddleware(), TerritoryController.deleteSector);

/**
 * @swagger
 * /api/territories/neighborhoods:
 *   post:
 *     summary: Créer un quartier
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Neighborhood'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Neighborhood'
 *
 *   get:
 *     summary: Récupérer tous les quartiers
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Neighborhood'
 */

/**
 * @swagger
 * /api/territories/many/neighborhoods:
 *   post:
 *     summary: Créer plusieurs quartiers
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Neighborhood'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Neighborhood'
 *       400:
 *         description: Erreur de validation ou données manquantes
 *       500:
 *         description: Erreur interne du serveur
 */


/**
 * @swagger
 * /api/territories/neighborhoods/{id}:
 *   get:
 *     summary: Récupérer un quartier par ID
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Neighborhood'
 *       404:
 *         description: Quartier non trouvé
 *
 *   put:
 *     summary: Mettre à jour un quartier
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Neighborhood'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Neighborhood'
 *
 *   delete:
 *     summary: Supprimer un quartier
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quartier supprimé
 */
router.post('/neighborhoods', authMiddleware(), TerritoryController.createNeighborhood);
router.get('/neighborhoods', authMiddleware(), TerritoryController.getNeighborhoods);
router.post('/many/neighborhoods', authMiddleware(), TerritoryController.createManyNeighborhoods);
router.get('/neighborhoods/:id', authMiddleware(), TerritoryController.getNeighborhood);
router.put('/neighborhoods/:id', authMiddleware(), TerritoryController.updateNeighborhood);
router.delete('/neighborhoods/:id', authMiddleware(), TerritoryController.deleteNeighborhood);


//complex queries
/**
 * @swagger
 * /api/territories/cities/{id}/full-details:
 *   get:
 *     summary: Récupérer les détails complets d'une ville
 *     description: Retourne la ville avec ses arrondissements et ses quartiers
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ville
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 city:
 *                   $ref: '#/components/schemas/City'
 *                 arrondissements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Arrondissement'
 *                 neighborhoods:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Neighborhood'
 *       404:
 *         description: Ville non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */

router.get('/cities/:id/full-details', authMiddleware(), TerritoryController.findCityWithAllDetails);

/**
 * @swagger
 * /api/territories/neighborhoods/{id}/full-details:
 *   get:
 *     summary: Récupérer les détails complets d'un quartier
 *     description: Retourne le quartier avec son secteur, son arrondissement et sa ville
 *     tags: [Territories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du quartier
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 neighborhood:
 *                   $ref: '#/components/schemas/Neighborhood'
 *                 sector:
 *                   $ref: '#/components/schemas/Sector'
 *                 arrondissement:
 *                   $ref: '#/components/schemas/Arrondissement'
 *                 city:
 *                   $ref: '#/components/schemas/City'
 *       404:
 *         description: Quartier non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/neighborhoods/:id/full-details', authMiddleware(), TerritoryController.findNeighborhoodWithAllDetails);

module.exports = router;