const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/subscription.js');
// const { authMiddleware } = require('../middlewares/auth.js'); // sécurité JWT
// router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: API pour gérer les abonnements des clients
 */

/**
 * @swagger
 * /subscription/subscribe:
 *   post:
 *     summary: Permet à un client de s'abonner à un plan tarifaire d'une agence
 *     tags: [Abonnement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agencyId
 *               - pricingId
 *               - endDate
 *             properties:
 *               agencyId:
 *                 type: string
 *                 description: ID de l'agence
 *               pricingId:
 *                 type: string
 *                 description: ID du plan tarifaire
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Date de fin de l'abonnement
 *             example:
 *               agencyId: 64f7a1b23456789abcdef123
 *               pricingId: 64f7a1b23456789abcdef456
 *               endDate: 2025-12-31
 *     responses:
 *       201:
 *         description: Abonnement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Champs obligatoires manquants
 *       500:
 *         description: Erreur serveur
 */
router.post('/subscribe', SubscriptionController.subscribe);

/**
 * @swagger
 * /subscription/client/{clientId}:
 *   get:
 *     summary: Récupérer tous les abonnements d'un client
 *     tags: [Abonnement]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client
 *     responses:
 *       200:
 *         description: Liste des abonnements du client
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Erreur serveur
 */
router.get('/client/:clientId', SubscriptionController.getClientSubscriptions);

/**
 * @swagger
 * /subscription/all:
 *   get:
 *     summary: Récupérer tous les abonnements (admin seulement)
 *     tags: [Abonnement]
 *     responses:
 *       200:
 *         description: Liste de tous les abonnements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       500:
 *         description: Erreur serveur
 */
router.get('/all', SubscriptionController.getAllSubscriptions);

/**
 * @swagger
 * /subscription/cancel/{subscriptionId}:
 *   patch:
 *     summary: Annuler un abonnement
 *     tags: [Abonnement]
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'abonnement
 *     responses:
 *       200:
 *         description: Abonnement annulé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Abonnement introuvable
 *       500:
 *         description: Erreur serveur
 */
router.patch('/cancel/:subscriptionId', SubscriptionController.cancel);

module.exports = router;
