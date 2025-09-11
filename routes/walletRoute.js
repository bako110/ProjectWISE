import { createWallet, getWalletByUserId, getAllWallets, addFunds } from "../controllers/walletController.js";
import express from "express";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wallets
 *   description: API pour gérer les wallets
 */

//create wallet
/**
 * @swagger
 * /api/users/{userId}/wallet:
 *   post:
 *     summary: Créer un wallet pour un utilisateur
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       201:
 *         description: Wallet créé avec succès
 *       400:
 *         description: Champs requis manquants
 *       500:
 *         description: Erreur serveur
 */
router.post('/users/:userId/wallet', createWallet);

//add funds to wallet
/**
 * @swagger
 * /api/users/{userId}/wallet/{amount}:
 *   post:
 *     summary: Ajouter des fonds au wallet d'un utilisateur
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *       - in: path
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *         description: Montant à ajouter
 *     responses:
 *       200:
 *         description: Fonds ajoutés avec succès
 *       400:
 *         description: Champs requis manquants
 *       404:
 *         description: Wallet non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/users/:userId/wallet/:amount', addFunds);

//get wallet by userId
/**
 * @swagger
 * /api/users/{userId}/wallet:
 *   get:
 *     summary: Récupérer le wallet d'un utilisateur par son ID
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Wallet récupéré avec succès
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Wallet non trouvé
 *       500:
 *         description: Erreur serveur
 */

router.get('/users/:userId/wallet', getWalletByUserId);

//get all wallets
/**
 * @swagger
 * /api/wallets:
 *   get:
 *     summary: Récupérer tous les wallets
 *     tags: [Wallets]
 *     responses:
 *       200:
 *         description: Liste des wallets
 *       404:
 *         description: Aucun wallet trouvé
 *       500:
 *         description: Erreur serveur
 */

router.get('/wallets', getAllWallets);

export default router;