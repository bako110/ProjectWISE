import express from 'express';
import { createSubscription, getAllSubscriptions, getSubscriptionsByUser, } from '../controllers/subscriptionController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: API pour gérer les abonnements
 */

// Route to create a subscription
/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Créer un abonnement
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - agencyId
 *               - plan
 *               - amount
 *               - endDate
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64fa7cf123abc456def78901"
 *               agencyId:
 *                 type: string
 *                 example: "64fa7cf123abc456def78902"
 *               plan:
 *                 type: string
 *                 enum: [basic, premium, enterprise]
 *                 example: "premium"
 *               amount:
 *                 type: number
 *                 example: 49.99
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-09-11T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-11T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Abonnement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Abonnement créé avec succès
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Champs obligatoires manquants ou invalides
 *       404:
 *         description: Utilisateur ou agence non trouvée
 *       500:
 *         description: Erreur serveur
 */

router.post('/subscriptions', createSubscription);
// Route to get subscriptions by user
router.get('/subscriptions/user/:userId', getSubscriptionsByUser);
// Route to get all subscriptions
router.get('/subscriptions', getAllSubscriptions);

export default router;