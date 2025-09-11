import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import {
  creerPlanning,
  listerPlannings,
  mettreAJourPlanning,
  historiqueParCollecteur,
  supprimerPlanning,
  getPlannings,
  getCollectorPlannings
} from '../../controllers/agency/planningController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Plannings
 *   description: Gestion des plannings / tournées de collecte
 */

/**
 * @swagger
 * /api/zones/plannings:
 *   post:
 *     summary: Créer un nouveau planning
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Données du planning à créer
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - zoneId
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *               - collectorId
 *               - agencyId
 *               - date
 *             properties:
 *               zoneId:
 *                 type: string
 *                 example: "64fa7cf123abc456def78901"
 *               dayOfWeek:
 *                 type: number
 *                 example: 1
 *                 description: 0 pour dimanche, 1 pour lundi, etc.
 *               startTime:
 *                 type: string
 *                 example: "08:00"
 *               endTime:
 *                 type: string
 *                 example: "10:00"
 *               collectorId:
 *                 type: string
 *                 example: "64fa7cf123abc456def78902"
 *               agencyId:
 *                 type: string
 *                 example: "64fa7cf123abc456def78903"
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Planning créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', authMiddleware('agency', 'manager'), creerPlanning);

/**
 * @swagger
 * /api/zones/plannings:
 *   get:
 *     summary: Lister les plannings (filtrables par collecteur, zone ou jour)
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: collectorId
 *         schema:
 *           type: string
 *         description: ID du collecteur
 *       - in: query
 *         name: zoneId
 *         schema:
 *           type: string
 *         description: ID de la zone
 *       - in: query
 *         name: dayOfWeek
 *         schema:
 *           type: number
 *           example: 2
 *         description: Jour de la semaine (0 = dimanche, 6 = samedi)
 *     responses:
 *       200:
 *         description: Liste des plannings
 */
router.get('/', authMiddleware('agency', 'manager', 'collector'), listerPlannings);

/**
 * @swagger
 * /api/zones/plannings/{id}:
 *   patch:
 *     summary: Mettre à jour un planning
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du planning à mettre à jour
 *     requestBody:
 *       description: Données à modifier
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "11:00"
 *               collectorId:
 *                 type: string
 *                 example: "64fbc0d2a95e1234ef567890"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Planning mis à jour
 *       404:
 *         description: Planning non trouvé
 */
router.patch('/:id', authMiddleware('agency', 'manager'), mettreAJourPlanning);

/**
 * @swagger
 * /api/zones/plannings/historique/{collecteurId}:
 *   get:
 *     summary: Récupérer l'historique des tournées d'un collecteur
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collecteurId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du collecteur
 *     responses:
 *       200:
 *         description: Liste des tournées passées du collecteur
 */
router.get('/historique/:collecteurId', authMiddleware('agency', 'manager', 'collector'), historiqueParCollecteur);

/**
 * @swagger
 * /api/zones/plannings/{id}:
 *   delete:
 *     summary: Supprimer un planning
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du planning à supprimer
 *     responses:
 *       200:
 *         description: Planning supprimé avec succès
 *       404:
 *         description: Planning non trouvé
 */
router.delete('/:id', authMiddleware('agency', 'manager'), supprimerPlanning);

/**
 * @swagger
 * /api/zones/plannings/agency/{agencyId}:
 *   get:
 *     summary: Récupérer tous les plannings d'une agence
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agence
 *     responses:
 *       200:
 *         description: Liste des plannings de l'agence
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Agence non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/agency/:agencyId', authMiddleware('agency', 'manager', 'collector'), getPlannings);

/**
 * @swagger
 * /api/zones/plannings/collector/{collectorId}:
 *   get:
 *     summary: Récupérer tous les plannings d'un collecteur
 *     tags: [Plannings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du collecteur
 *     responses:
 *       200:
 *         description: Liste des plannings du collecteur
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Collecteur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/collector/:collectorId', authMiddleware('collector'), getCollectorPlannings);

export default router;
