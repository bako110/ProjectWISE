const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Gestion des équipes de collecteurs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *         name:
 *           type: string
 *           description: Nom de l'équipe
 *         agencyId:
 *           type: string
 *           format: objectId
 *           description: ID de l'agence
 *         leaderId:
 *           type: string
 *           format: objectId
 *           description: ID du chef d'équipe
 *         collectors:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: Liste des IDs des collecteurs
 *         zones:
 *           type: array
 *           items:
 *             type: string
 *           description: Zones de collecte assignées
 *         maxClientsPerDay:
 *           type: number
 *           description: Nombre maximum de clients par jour
 *           default: 50
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Statut de l'équipe
 *           default: active
 *         description:
 *           type: string
 *           description: Description de l'équipe
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TeamStats:
 *       type: object
 *       properties:
 *         activeClientGroups:
 *           type: number
 *           description: Nombre de groupes de clients actifs
 *         totalClients:
 *           type: number
 *           description: Nombre total de clients assignés
 *         totalCollectors:
 *           type: number
 *           description: Nombre de collecteurs dans l'équipe
 *         zonesCount:
 *           type: number
 *           description: Nombre de zones couvertes
 */

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Créer une nouvelle équipe
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - agencyId
 *               - leaderId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Équipe Nord"
 *               agencyId:
 *                 type: string
 *                 format: objectId
 *                 example: "64f1b82a5e3d9c2b68d94b73"
 *               leaderId:
 *                 type: string
 *                 format: objectId
 *                 example: "64f1b82a5e3d9c2b68d94b75"
 *               collectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *                 example: ["64f1b82a5e3d9c2b68d94b76", "64f1b82a5e3d9c2b68d94b77"]
 *               zones:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Pissy", "Kossodo"]
 *               maxClientsPerDay:
 *                 type: number
 *                 example: 60
 *               description:
 *                 type: string
 *                 example: "Équipe spécialisée pour le secteur nord"
 *     responses:
 *       201:
 *         description: Équipe créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Team'
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authMiddleware(), teamController.createTeam);

/**
 * @swagger
 * /api/teams/agency/{agencyId}:
 *   get:
 *     summary: Obtenir toutes les équipes d'une agence
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID de l'agence
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des équipes
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiListResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Team'
 *       500:
 *         description: Erreur serveur
 */
router.get('/agency/:agencyId', authMiddleware(), teamController.getTeamsByAgency);

/**
 * @swagger
 * /api/teams/{teamId}:
 *   get:
 *     summary: Obtenir les détails d'une équipe
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID de l'équipe
 *     responses:
 *       200:
 *         description: Détails de l'équipe
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Team'
 *       404:
 *         description: Équipe non trouvée
 *       500:
 *         description: Erreur serveur
 *   put:
 *     summary: Mettre à jour une équipe
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID de l'équipe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               leaderId:
 *                 type: string
 *                 format: objectId
 *               collectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *               zones:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxClientsPerDay:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Équipe mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Team'
 *       404:
 *         description: Équipe non trouvée
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     summary: Supprimer une équipe
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID de l'équipe
 *     responses:
 *       200:
 *         description: Équipe supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Équipe non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:teamId', authMiddleware(), teamController.getTeamById);
router.put('/:teamId', authMiddleware(), teamController.updateTeam);
router.delete('/:teamId', authMiddleware(), teamController.deleteTeam);

/**
 * @swagger
 * /api/teams/{teamId}/stats:
 *   get:
 *     summary: Obtenir les statistiques d'une équipe
 *     tags: [Teams]
 *     description: Retourne les statistiques détaillées de performance d'une équipe
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID de l'équipe
 *     responses:
 *       200:
 *         description: Statistiques de l'équipe
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TeamStats'
 *       404:
 *         description: Équipe non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:teamId/stats', authMiddleware(), teamController.getTeamStats);

module.exports = router;
