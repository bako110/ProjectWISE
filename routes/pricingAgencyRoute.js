const express = require('express');
const {
    createPricingController,
    getPricingsController,
    updatePricingController,
    deletePricingController
} = require('../controllers/pricingAgency.js');
const { authMiddleware } = require('../middleware/auth.js');

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Pricing
 *   description: API for managing agency pricing plans
 */

/**
 * @swagger
 * /api/pricing:
 *   post:
 *     summary: Create a new pricing plan for the authenticated agency
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planType:
 *                 type: string
 *                 enum: [standard, premium, enterprise]
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               numberOfPasses:
 *                 type: number
 *             example:
 *               planType: premium
 *               price: 1000
 *               description: Premium plan
 *               numberOfPasses: 5
 *     responses:
 *       201:
 *         description: Pricing created successfully
 *       500:
 *         description: Server error
 */
router.post('/', createPricingController);

/**
 * @swagger
 * /api/pricing:
 *   get:
 *     summary: Get all pricing plans of the authenticated agency
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pricing plans
 *       500:
 *         description: Server error
 */
router.get('/', getPricingsController);

/**
 * @swagger
 * /api/pricing/{id}:
 *   put:
 *     summary: Update an existing pricing plan
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the pricing plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planType:
 *                 type: string
 *                 enum: [standard, premium, enterprise]
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               numberOfPasses:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pricing updated
 *       404:
 *         description: Pricing not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updatePricingController);

/**
 * @swagger
 * /api/pricing/{id}:
 *   delete:
 *     summary: Delete an existing pricing plan
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the pricing plan
 *     responses:
 *       200:
 *         description: Pricing deleted
 *       404:
 *         description: Pricing not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deletePricingController);

module.exports = router;
