const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agency');
// const { authenticate, authorize } = require('../middlewares/auth');


/**
 * @swagger
 * /api/agencies:
 *   get:
 *     summary: Récupérer toutes les agences avec pagination et filtres
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, deleted]
 *         description: Filtrer par statut
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche (nom, description, slogan)
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
 *         description: Liste des agences récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agency'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', agencyController.getAllAgencies);

/**
 * @swagger
 * /api/agencies/status/{status}:
 *   get:
 *     summary: Récupérer les agences par statut
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/statusParam'
 *     responses:
 *       200:
 *         description: Liste des agences par statut
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agency'
 *                 count:
 *                   type: integer
 *       400:
 *         description: Statut non valide
 *       500:
 *         description: Erreur serveur
 */
router.get('/status/:status', agencyController.getAgenciesByStatus);

/**
 * @swagger
 * /api/agencies/{id}:
 *   get:
 *     summary: Récupérer une agence par son ID
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/agencyId'
 *     responses:
 *       200:
 *         description: Agence récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agency'
 *       404:
 *         description: Agence non trouvée
 */
router.get('/:id', agencyController.getAgency);

/**
 * @swagger
 * /api/agencies/{id}:
 *   put:
 *     summary: Mettre à jour une agence
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/agencyId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               agencyDescription:
 *                 type: string
 *               zoneActivite:
 *                 type: string
 *               slogan:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, deleted]
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: object
 *     responses:
 *       200:
 *         description: Agence mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agency'
 *                 message:
 *                   type: string
 *                   example: "Agence mise à jour avec succès"
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Agence non trouvée
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/:id', agencyController.updateAgency);

/**
 * @swagger
 * /api/agencies/{id}:
 *   delete:
 *     summary: Supprimer une agence (soft delete)
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/agencyId'
 *     responses:
 *       200:
 *         description: Agence supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agency'
 *                 message:
 *                   type: string
 *                   example: "Agence supprimée avec succès"
 *       404:
 *         description: Agence non trouvée
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/:id',  agencyController.deleteAgency);

/**
 * @swagger
 * /api/agencies/{id}/zone:
 *   patch:
 *     summary: Mettre à jour la zone d'une agence
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/schemas/Agency/agencyId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               zoneActivite:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zone mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agency'
 *                 message:
 *                   type: string
 *                   example: "Zone mise à jour avec succès"
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Agence non trouvée
 */
router.patch('/:id/zone',  agencyController.upadateZone);

module.exports = router;