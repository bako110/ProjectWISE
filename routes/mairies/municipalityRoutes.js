import express from 'express';
import { registerMunicipality,getMunicipality, getAllMunicipalities, statisticsByCity } from '../../controllers/mairies/municipalityControllers.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/municipality:
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

/**
 * @swagger
 * /api/auth/municipality/{municipalityId}:
 *   get:
 *     summary: Récupérer les détails d'une mairie par son ID
 *     tags: [Mairies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: municipalityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mairie à récupérer
 *     responses:
 *       200:
 *         description: Détails de la mairie récupérés avec succès
 *       400:
 *         description: ID de la mairie requis
 *       404:
 *         description: Mairie non trouvée
 */
router.get('/municipality/:municipalityId', authMiddleware('super_admin'), getMunicipality);

/**
 * @swagger
 * /api/auth/municipality:
 *   get:
 *     summary: Lister toutes les mairies
 *     tags: [Mairies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des mairies récupérée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/municipality', authMiddleware('super_admin'), getAllMunicipalities);

router.get('/city/municipality', statisticsByCity);

export default router;
