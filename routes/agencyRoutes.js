const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agency');
// const { authenticate, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Agency:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique de l'agence
 *         name:
 *           type: string
 *           description: Nom de l'agence
 *         agencyDescription:
 *           type: string
 *           description: Description de l'agence
 *         zoneActivite:
 *           type: string
 *           description: Zone d'activité
 *         slogan:
 *           type: string
 *           description: Slogan de l'agence
 *         status:
 *           type: string
 *           enum: [active, inactive, deleted]
 *           description: Statut de l'agence
 *         owner:
 *           type: object
 *           description: Propriétaire de l'agence
 *         gestionnaires:
 *           type: array
 *           items:
 *             type: object
 *           description: Liste des gestionnaires
 *         documents:
 *           type: array
 *           items:
 *             type: string
 *           description: Documents associés
 *         location:
 *           type: object
 *           description: Localisation de l'agence
 * 
 *   parameters:
 *     agencyId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: ID de l'agence
 *     statusParam:
 *       in: path
 *       name: status
 *       required: true
 *       schema:
 *         type: string
 *         enum: [active, inactive, deleted]
 *       description: Statut des agences à récupérer
 * 
 *   responses:
 *     UnauthorizedError:
 *       description: Token d'authentification manquant ou invalide
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Non authentifié"
 *     ForbiddenError:
 *       description: Droits insuffisants
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Accès non autorisé"
 */

// Appliquer l'authentification à toutes les routes
// router.use(authenticate);

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
 * /api/agencies/{id}/status:
 *   patch:
 *     summary: Changer le statut d'une agence
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, deleted]
 *                 description: Nouveau statut de l'agence
 *     responses:
 *       200:
 *         description: Statut modifié avec succès
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
 *                   example: "Statut de l'agence changé à active avec succès"
 *       400:
 *         description: Statut invalide
 *       404:
 *         description: Agence non trouvée
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch('/:id/status',  agencyController.changeStatus);

/**
 * @swagger
 * /api/agencies/{id}/activate:
 *   patch:
 *     summary: Activer une agence
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/agencyId'
 *     responses:
 *       200:
 *         description: Agence activée avec succès
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
 *                   example: "Agence activée avec succès"
 *       404:
 *         description: Agence non trouvée
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch('/:id/activate', agencyController.activateAgency);

/**
 * @swagger
 * /api/agencies/{id}/deactivate:
 *   patch:
 *     summary: Désactiver une agence
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/agencyId'
 *     responses:
 *       200:
 *         description: Agence désactivée avec succès
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
 *                   example: "Agence désactivée avec succès"
 *       404:
 *         description: Agence non trouvée
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch('/:id/deactivate', agencyController.deactivateAgency);

module.exports = router;