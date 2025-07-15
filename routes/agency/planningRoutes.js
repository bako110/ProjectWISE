import express from 'express';
import auth from '../../middlewares/authMiddleware.js';
import { authorizeRoles } from '../../middlewares/agency/roleMiddleware.js';
import {
  creerPlanning,
  listerPlannings,
  mettreAJourPlanning,
  historiqueParCollecteur,
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
 * /api/plannings:
 *   post:
 *     summary: Créer un nouveau planning
 *     tags:
 *       - Plannings
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
 *               - date
 *               - heure
 *               - zone
 *               - collecteur
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-16"
 *               heure:
 *                 type: string
 *                 example: "14:00"
 *               zone:
 *                 type: string
 *                 example: "64fa7cf123abc456def78901"
 *               collecteur:
 *                 type: string
 *                 example: "64fa7cf123abc456def78902"
 *     responses:
 *       201:
 *         description: Planning créé avec succès
 *       400:
 *         description: Données invalides
 */

/**
 * @swagger
 * /api/plannings:
 *   get:
 *     summary: Lister les plannings (filtrables par collecteur, zone, date)
 *     tags:
 *       - Plannings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: collecteur
 *         schema:
 *           type: string
 *         description: ID du collecteur
 *       - in: query
 *         name: zone
 *         schema:
 *           type: string
 *         description: ID de la zone
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de la tournée
 *     responses:
 *       200:
 *         description: Liste des plannings
 */

/**
/**
 * @swagger
 * /api/plannings/{id}:
 *   patch:
 *     summary: "Mettre à jour un planning (ex: marquer collecte effectuée)"
 *     tags:
 *       - Plannings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du planning
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Données à mettre à jour
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut:
 *                 type: string
 *                 enum:
 *                   - prévu
 *                   - effectué
 *                   - problème
 *                 example: effectué
 *               commentaire:
 *                 type: string
 *                 example: "Collecte réalisée sans problème"
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "url1.jpg"
 *                   - "url2.jpg"
 *               positionGPS:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 12.345678
 *                   lng:
 *                     type: number
 *                     example: -1.234567
 *     responses:
 *       200:
 *         description: Planning mis à jour
 *       404:
 *         description: Planning non trouvé
 */

/**
 * @swagger
 * /api/plannings/historique/{collecteurId}:
 *   get:
 *     summary: Récupérer l'historique des tournées d'un collecteur
 *     tags:
 *       - Plannings
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
 *         description: Liste des tournées historiques
 */

router.post('/', auth, authorizeRoles('admin-agency'), creerPlanning);
router.get('/', auth, authorizeRoles('admin-agency', 'collector'), listerPlannings);
router.patch('/:id', auth, authorizeRoles('collector', 'admin-agency'), mettreAJourPlanning);
router.get('/historique/:collecteurId', auth, authorizeRoles('collector', 'admin-agency'), historiqueParCollecteur);

export default router;
