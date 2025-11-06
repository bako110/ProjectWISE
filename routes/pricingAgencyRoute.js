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
 *   name: Tarification
 *   description: API pour gérer les plans tarifaires des agences
 */

/**
 * @swagger
 * /api/pricing:
 *   post:
 *     summary: Créer un nouveau plan tarifaire pour une agence
 *     tags: [Tarification]
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
 *                 description: ID de l'agence
 *               planType:
 *                 type: string
 *                 enum: [standard, premium, enterprise]
 *                 description: Type de plan
 *               price:
 *                 type: number
 *                 description: Prix du plan
 *               description:
 *                 type: string
 *                 description: Description du plan
 *               numberOfPasses:
 *                 type: number
 *                 description: Nombre de passes inclus
 *             example:
 *               agencyId: 64f7a1b23456789abcdef123
 *               planType: premium
 *               price: 1000
 *               description: Plan premium
 *               numberOfPasses: 5
 *     responses:
 *       201:
 *         description: Plan tarifaire créé avec succès
 *       400:
 *         description: Requête incorrecte (agence manquante)
 *       500:
 *         description: Erreur serveur
 */
router.post('/', createPricingController);

/**
 * @swagger
 * /api/pricing/{agencyId}:
 *   get:
 *     summary: Récupérer tous les plans tarifaires d'une agence
 *     tags: [Tarification]
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'agence
 *     responses:
 *       200:
 *         description: Liste des plans tarifaires
 *       400:
 *         description: Requête incorrecte (agence manquante)
 *       500:
 *         description: Erreur serveur
 */
router.get('/:agencyId', getPricingsController);

/**
 * @swagger
 * /api/pricing/{id}:
 *   put:
 *     summary: Mettre à jour un plan tarifaire existant
 *     tags: [Tarification]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du plan tarifaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *               description: Plan mis à jour
 *               numberOfPasses: 6
 *     responses:
 *       200:
 *         description: Plan tarifaire mis à jour
 *       400:
 *         description: Requête incorrecte (agence manquante)
 *       404:
 *         description: Plan tarifaire introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', updatePricingController);

/**
 * @swagger
 * /api/pricing/{id}:
 *   delete:
 *     summary: Supprimer un plan tarifaire existant
 *     tags: [Tarification]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du plan tarifaire
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
 *         description: Plan tarifaire supprimé
 *       400:
 *         description: Requête incorrecte (agence manquante)
 *       404:
 *         description: Plan tarifaire introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', deletePricingController);

module.exports = router;
