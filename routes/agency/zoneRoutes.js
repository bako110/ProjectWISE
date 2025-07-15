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

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Zones
 *   description: Gestion des zones de couverture par les agences
 */

/**
 * @swagger
 * /api/zones:
 *   post:
 *     summary: Créer une nouvelle zone
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
 *               - agencyId
 *               - name
 *               - location
 *               - polygonGeoJson
 *             properties:
 *               agencyId:
 *                 type: string
 *                 example: "64fa7cf..."
 *               name:
 *                 type: string
 *                 example: "Secteur 10 Tampouy"
 *               location:
 *                 type: object
 *                 properties:
 *                   region: { type: string, example: "Centre" }
 *                   province: { type: string, example: "Kadiogo" }
 *                   commune: { type: string, example: "Ouagadougou" }
 *                   arrondissement: { type: string, example: "Baskuy" }
 *                   secteur: { type: string, example: "Secteur 10" }
 *                   quartier: { type: string, example: "Tampouy" }
 *               polygonGeoJson:
 *                 type: object
 *                 example: {
 *                   "type": "Polygon",
 *                   "coordinates": [[[1.5, 2.1], [1.6, 2.2], [1.7, 2.1], [1.5, 2.1]]]
 *                 }
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
 *               location:
 *                 type: object
 *               polygonGeoJson:
 *                 type: object
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

router.post('/', auth, authorizeRoles('admin-agency'), createZone);
router.get('/agency/:agencyId', auth, authorizeRoles('admin-agency'), getZonesByAgency);
router.get('/:id', auth, authorizeRoles('admin-agency'), getZoneById);
router.put('/:id', auth, authorizeRoles('admin-agency'), updateZone);
router.delete('/:id', auth, authorizeRoles('admin-agency'), deleteZone);
router.put('/:id/assign-collectors', auth, authorizeRoles('admin-agency'), assignCollectorsToZone);

export default router;
