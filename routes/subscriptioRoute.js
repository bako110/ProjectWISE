const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/subscription.js');
// const { authMiddleware } = require('../middlewares/auth.js'); // sécurité JWT

// router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: API for managing client subscriptions
 */

/**
 * @swagger
 * /subscription/subscribe:
 *   post:
 *     summary: Allow a client to subscribe to an agency's pricing plan
 *     tags: [Subscription]
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
 *               - pricingId
 *               - endDate
 *             properties:
 *               agencyId:
 *                 type: string
 *                 description: ID of the agency
 *               pricingId:
 *                 type: string
 *                 description: ID of the pricing plan
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Subscription end date
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/subscribe', SubscriptionController.subscribe);

/**
 * @swagger
 * /subscription/client/{clientId}:
 *   get:
 *     summary: Get all subscriptions for a client
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: List of client subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/client/:clientId', SubscriptionController.getClientSubscriptions);

/**
 * @swagger
 * /subscription/all:
 *   get:
 *     summary: Get all subscriptions (admin only)
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/all', SubscriptionController.getAllSubscriptions);

/**
 * @swagger
 * /subscription/cancel/{subscriptionId}:
 *   patch:
 *     summary: Cancel a subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Subscription canceled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Server error
 */
router.patch('/cancel/:subscriptionId', SubscriptionController.cancel);

module.exports = router;
