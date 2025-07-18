import express from 'express';
import { registerMunicipality } from '../../controllers/mairies/municipalityControllers.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * api/auth/municipality:
 *   post:
 *     summary: Enregistrer une nouvelle mairie
 *     tags: [Mairies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - firstName
 *               - lastName
 *               - commune
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID MongoDB de l'utilisateur lié
 *               agencyId:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des agences liées à cette mairie
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               commune:
 *                 type: object
 *                 properties:
 *                   region:
 *                     type: string
 *                   province:
 *                     type: string
 *                   name:
 *                     type: string
 *               managedZones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     arrondissement:
 *                       type: string
 *                     secteur:
 *                       type: string
 *                     quartier:
 *                       type: string
 *                     village:
 *                       type: string
 *               position:
 *                 type: string
 *                 default: Maire
 *     responses:
 *       201:
 *         description: Mairie créée avec succès
 *       400:
 *         description: Champs obligatoires manquants ou données invalides
 *       401:
 *         description: Non autorisé, rôle super_admin requis
 */
router.post('/municipality', authMiddleware('super_admin'), registerMunicipality);

export default router;
