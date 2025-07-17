import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { subscribeToAgency, getClientProfile } from '../../controllers/clients/clientController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Client
 *   description: Opérations liées au client (profil, abonnement)
 */

/**
 * @swagger
 * /api/clients/profile:
 *   get:
 *     summary: Obtenir le profil du client connecté
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du profil client récupérées avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       401:
 *         description: Non autorisé. Token manquant ou invalide.
 */
router.get('/profile', authMiddleware, getClientProfile);

/**
 * @swagger
 * /api/clients/subscribe:
 *   post:
 *     summary: S'abonner à une agence
 *     tags: [Client]
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
 *             properties:
 *               agencyId:
 *                 type: string
 *                 description: ID de l'agence à laquelle le client souhaite s'abonner
 *     responses:
 *       200:
 *         description: Abonnement effectué avec succès.
 *       400:
 *         description: Requête invalide ou agence introuvable.
 *       401:
 *         description: Non autorisé.
 */
router.post('/subscribe', authMiddleware('client'), subscribeToAgency);

export default router;
