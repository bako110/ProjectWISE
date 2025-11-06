const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/wallet');
const { authMiddleware } = require('../middlewares/auth.js');

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: API pour gérer les wallets
 */

/**
 * @swagger
 * /wallet/create:
 *   post:
 *     summary: Créer un wallet pour un utilisateur
 *     tags: [Wallet]
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
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *               kind:
 *                 type: string
 *                 enum: [standard, premium]
 *                 default: standard
 *                 description: Type de wallet
 *     responses:
 *       201:
 *         description: Wallet créé avec succès
 *       400:
 *         description: Erreur de création
 */
router.post('/create', authMiddleware(), WalletController.createWalletController);

/**
 * @swagger
 * /wallet/{userId}:
 *   get:
 *     summary: Récupérer le wallet d'un utilisateur
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Wallet trouvé
 *       404:
 *         description: Wallet non trouvé
 */
router.get('/:userId', authMiddleware(), WalletController.getWalletController);

/**
 * @swagger
 * /wallet/add:
 *   post:
 *     summary: Ajouter du solde au wallet
 *     tags: [Wallet]
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
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *               amount:
 *                 type: number
 *                 description: Montant à ajouter
 *     responses:
 *       200:
 *         description: Solde ajouté
 *       400:
 *         description: Erreur lors de l'ajout
 */
router.post('/add', authMiddleware(), WalletController.addBalanceController);

/**
 * @swagger
 * /wallet/remove:
 *   post:
 *     summary: Retirer du solde du wallet
 *     tags: [Wallet]
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
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *               amount:
 *                 type: number
 *                 description: Montant à retirer
 *     responses:
 *       200:
 *         description: Solde retiré
 *       400:
 *         description: Erreur lors du retrait
 */
router.post('/remove', authMiddleware(), WalletController.removeBalanceController);

module.exports = router;
