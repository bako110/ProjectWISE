import express from 'express';
import {
  createZone,
  getZonesByAgency,
  getZoneById,
  updateZone,
  deleteZone,
  assignCollectorsToZone
} from '../../controllers/agency/zoneController.js';

import auth from '../../middlewares/authMiddleware.js';
import { authorizeRoles } from '../../middlewares/agency/roleMiddleware.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Zones
 *   description: Gestion des zones de couverture par les agences
 */

/**
 * @swagger
 * /api/zones/register:
 *   post:
 *     summary: Créer une nouvelle zone (agencyId est pris depuis le token)
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - boundaries
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Secteur 10 Tampouy"
 *               description:
 *                 type: string
 *                 example: "Zone de collecte principale"
 *               boundaries:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 12.345678
 *                     longitude:
 *                       type: number
 *                       example: -1.234567
 *               neighborhoods:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Tampouy", "Koulouba"]
 *               cities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Ouagadougou"]
 *               assignedCollectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64fa7c...1", "64fa7c...2"]
 *     responses:
 *       201:
 *         description: Zone créée avec succès
 *       404:
 *         description: Agence non trouvée
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/zones/agency/{agencyId}:
 *   get:
 *     summary: Récupérer toutes les zones d’une agence
 *     tags: [Zones]
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
 *         description: Liste des zones
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/zones/{id}:
 *   get:
 *     summary: Récupérer une zone par ID
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la zone
 *     responses:
 *       200:
 *         description: Détails de la zone
 *       404:
 *         description: Zone non trouvée
 */

/**
 * @swagger
 * /api/zones/{id}:
 *   put:
 *     summary: Mettre à jour une zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               boundaries:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *               neighborhoods:
 *                 type: array
 *                 items:
 *                   type: string
 *               cities:
 *                 type: array
 *                 items:
 *                   type: string
 *               assignedCollectors:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Zone mise à jour
 *       404:
 *         description: Zone non trouvée
 */

/**
 * @swagger
 * /api/zones/{id}:
 *   delete:
 *     summary: Supprimer une zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la zone
 *     responses:
 *       200:
 *         description: Zone supprimée avec succès
 *       404:
 *         description: Zone non trouvée
 */

/**
 * @swagger
 * /api/zones/{id}/assign-collectors:
 *   put:
 *     summary: Assigner des collecteurs à une zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la zone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assignedCollectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64fa7c...1", "64fa7c...2"]
 *     responses:
 *       200:
 *         description: Collecteurs assignés avec succès
 *       404:
 *         description: Zone non trouvée
 */

router.post('/register', auth, authMiddleware('agency'), createZone);
router.get('/agency/:agencyId', authMiddleware('agency'), getZonesByAgency);
router.get('/:id', authMiddleware('agency'), getZoneById);
router.put('/:id', authMiddleware('agency'), updateZone);
router.delete('/:id', authMiddleware('agency'), deleteZone);
router.put('/:id/assign-collectors', authMiddleware('agency'), assignCollectorsToZone);

export default router;
