const express = require('express');
const router = express.Router();

const TransactionController = require('../controllers/transaction.js');

// import TransactionController from '../controllers/transaction.js';

/**
 * @swagger
 * /api/transactions/initiate:
 *   post:
 *     summary: Initier un paiement Orange Money
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - customerMsisdn
 *               - tarifId
 *               - tarifId
 *               - userId
 *               - walletId
 *               - operator
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               customerMsisdn:
 *                 type: string
 *                 example: "75612222"
 *               pricingId:
 *                 type: string
 *                 example: "6650b8e9f4e8d32f9c9d1111"
 *               walletId:
 *                 type: string
 *                 example: "6650b8e9f4e8d32f9c9d2222"
 *               userId:
 *                 type: string
 *                 example: "6650b8e9f4e8d32f9c9d2222"
 *               operator:
 *                 type: string
 *                 example: "MOOV_MONEY"
 *                 enum: [ORANGE_MONEY, MOOV_MONEY]
 *               numberMonths:
 *                 type: number
 *                 example: 3
 *     responses:
 *       201:
 *         description: OTP demandé
 *       400:
 *         description: Erreur métier
 */
router.post('/initiate', TransactionController.initiate);

/**
 * @swagger
 * /api/transactions/resend-otp:
 *   post:
 *     summary: Renvoyer l'OTP
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required:
 *         - reference
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reference:
 *                 type: string
 *                 example: "TXN-1710000000000"
 *     responses:
 *       200:
 *         description: OTP renvoyé
 *       400:
 *         description: Transaction invalide
 */
router.post('/resend-otp', TransactionController.resendOtp);

/**
 * @swagger
 * /api/transactions/confirm:
 *   post:
 *     summary: Confirmer le paiement avec OTP
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required:
 *         - reference
 *         - otp
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reference:
 *                 type: string
 *                 example: "TXN-1710000000000"
 *               otp:
 *                 type: string
 *                 example: "541847"
 *     responses:
 *       200:
 *         description: Paiement réussi
 *       400:
 *         description: Paiement échoué
 */
router.post('/confirm', TransactionController.confirm);

module.exports = router;