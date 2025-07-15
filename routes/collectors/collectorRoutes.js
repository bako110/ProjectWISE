import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { createCollector } from '../../controllers/collectors/collectorController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Collecteurs
 *   description: Gestion des collecteurs
 */

/**
 * @swagger
 * /api/collectors:
 *   post:
 *     summary: Crée un nouveau collecteur (réservé aux agences authentifiées)
 *     tags: [Collecteurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Données du collecteur à créer
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phone
 *               - agencyId
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jean
 *               lastName:
 *                 type: string
 *                 example: Dupont
 *               phone:
 *                 type: string
 *                 example: "+22670123456"
 *               agencyId:
 *                 type: string
 *                 description: ID de l'agence à laquelle le collecteur appartient
 *                 example: 64a1234bcdef56789a123456
 *               assignedAreas:
 *                 type: array
 *                 description: Liste des zones géographiques assignées
 *                 items:
 *                   type: object
 *                   properties:
 *                     region:
 *                       type: string
 *                       example: Centre
 *                     province:
 *                       type: string
 *                       example: Kadiogo
 *                     commune:
 *                       type: string
 *                       example: Ouagadougou
 *               vehicleInfo:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: Moto
 *                   plateNumber:
 *                     type: string
 *                     example: ABC123
 *     responses:
 *       201:
 *         description: Collecteur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collecteur créé avec succès
 *                 collector:
 *                   $ref: '#/components/schemas/Collector'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authMiddleware, createCollector);

export default router;
