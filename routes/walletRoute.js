const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/wallet.js');
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
 *             $ref: '#/components/schemas/Wallet'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *         description: Wallet trouvé
 *       404:
 *         description: Wallet non trouvé
 */
router.get('/:userId', authMiddleware(), WalletController.getWalletController);

/**
 * @swagger
 * /wallet/add/{userId}/{amount}:
 *   post:
 *     summary: Ajouter du solde au wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur dont on veut augmenter le solde
 *         example: 615c1b5fcf1c2a3b2f4e4f22
 *       - in: path
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *         description: Montant à ajouter au solde
 *         example: 50
 *     responses:
 *       200:
 *         description: Solde ajouté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 wallet:
 *                   $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Erreur lors de l'ajout
 */
router.post('/add/:userId/:amount', authMiddleware(), WalletController.addBalanceController);

/**
 * @swagger
 * /wallet/remove/{userId}/{amount}:
 *   post:
 *     summary: Retirer du solde du wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur dont on veut augmenter le solde
 *         example: 615c1b5fcf1c2a3b2f4e4f22
 *       - in: path
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *         description: Montant à ajouter au solde
 *         example: 50
 *     responses:
 *       200:
 *         description: Solde retiré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 wallet:
 *                   $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Erreur lors du retrait
 */
router.post('/remove/:userId/:amount', authMiddleware(), WalletController.removeBalanceController);

module.exports = router;
