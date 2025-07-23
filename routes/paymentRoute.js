import express from 'express';
import { createPayment, verifyPayments, getAllPayments } from '../controllers/paymentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';


const router = express.Router();

// Route to create a payment
router.post('/create', createPayment);
// Route to verify a payment
router.post('/verify', verifyPayments);
// Route to get all payments
router.get('/all', getAllPayments);


/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: API pour gérer les paiements
 */

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     summary: Créer un paiement
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - phone
 *               - method
 *             properties:
 *               amount:
 *                 type: number
 *               phone:
 *                 type: string
 *               method:
 *                 type: string
 *               clientId:
 *                 type: string
 *               tarifId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paiement créé avec succès
 *       400:
 *         description: Champs requis manquants
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Vérifier un paiement
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referenceId
 *               - opt
 *             properties:
 *               referenceId:
 *                 type: string
 *               opt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paiement vérifié avec succès
 *       400:
 *         description: ID de référence requis
 *       404:
 *         description: Paiement non trouvé
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/payments/all:
 *   get:
 *     summary: Obtenir tous les paiements
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Liste des paiements
 *       404:
 *         description: Aucun paiement trouvé
 *       500:
 *         description: Erreur serveur
 */


export default router;