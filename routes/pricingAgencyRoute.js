const express = require('express');
const {
    createPricingController,
    getPricingsController,
    updatePricingController,
    deletePricingController
} = require('../controllers/pricingAgency.js');

const router = express.Router();

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
 *     summary: Create a new pricing plan for an agency
 *     tags: [Pricing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agencyId
 *               - planType
 *               - price
 *             properties:
 *               agencyId:
 *                 type: string
 *                 description: ID of the agency
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
 *               agencyId: 64f7a1b23456789abcdef123
 *               planType: premium
 *               price: 1000
 *               description: Premium plan
 *               numberOfPasses: 5
 *     responses:
 *       201:
 *         description: Pricing created successfully
 *       400:
 *         description: Bad request (missing agency)
 *       500:
 *         description: Server error
 */
router.post('/', createPricingController);

/**
 * @swagger
 * /api/pricing:
 *   get:
 *     summary: Get all pricing plans of an agency
 *     tags: [Pricing]
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
 *                 description: ID of the agency
 *             example:
 *               agencyId: 64f7a1b23456789abcdef123
 *     responses:
 *       200:
 *         description: List of pricing plans
 *       400:
 *         description: Bad request (missing agency)
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
 *             required:
 *               - agencyId
 *             properties:
 *               agencyId:
 *                 type: string
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
 *               agencyId: 64f7a1b23456789abcdef123
 *               planType: premium
 *               price: 1200
 *               description: Updated plan
 *               numberOfPasses: 6
 *     responses:
 *       200:
 *         description: Pricing updated
 *       400:
 *         description: Bad request (missing agency)
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
 *             required:
 *               - agencyId
 *             properties:
 *               agencyId:
 *                 type: string
 *             example:
 *               agencyId: 64f7a1b23456789abcdef123
 *     responses:
 *       200:
 *         description: Pricing deleted
 *       400:
 *         description: Bad request (missing agency)
 *       404:
 *         description: Pricing not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deletePricingController);

module.exports = router;
