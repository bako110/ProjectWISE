import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { scanBarrel, getScanHistory, getScanDetails } from '../../controllers/agency/scanController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Collectes
 *   description: Gestion des collectes via scan QR code sur barriques
 */

/**
 * @swagger
 * /api/scan/qr-code:
 *   post:
 *     summary: Valider un scan de barrique via QR code
 *     tags: [Collectes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - status
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: ID du client (barrique scannée)
 *                 example: "64fa7cf123abc456def78901"
 *               status:
 *                 type: string
 *                 enum: [collected, problem]
 *                 description: "Statut de la collecte : 'collected' pour collecte réussie, 'problem' pour problème rencontré"
 *                 example: collected
 *               comment:
 *                 type: string
 *                 description: "Commentaire décrivant le problème. Obligatoire si status est 'problem'"
 *                 example: "Le client n'était pas présent"
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste d'URLs ou chemins des photos illustrant le problème (optionnel)
 *                 example: ["http://example.com/photo1.jpg", "http://example.com/photo2.jpg"]
 *               positionGPS:
 *                 type: object
 *                 description: Coordonnées GPS du lieu de collecte (optionnel)
 *                 properties:
 *                   lat:
 *                     type: number
 *                     description: Latitude
 *                     example: 12.345678
 *                   lng:
 *                     type: number
 *                     description: Longitude
 *                     example: -1.234567
 *     responses:
 *       201:
 *         description: Scan enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Collecte validée avec succès"
 *                 report:
 *                   type: object
 *                   description: Détails du rapport de scan enregistré
 *       400:
 *         description: "Données invalides : clientId manquant, status absent ou comment obligatoire si status est 'problem'"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Données invalides"
 *       401:
 *         description: Non autorisé (token invalide ou rôle incorrect)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Non autorisé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur serveur interne"
 */

router.post('/qr-code', authMiddleware('collector'), scanBarrel);

/**
 * @swagger
 * /api/scan/history:
 *   get:
 *     summary: Récupérer l'historique des scans du collector
 *     tags: [Collectes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [collected, problem]
 *         description: Filtrer par statut
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filtrer par ID client
 *     responses:
 *       200:
 *         description: Liste des scans avec pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scans:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalScans:
 *                       type: integer
 */
router.get('/history', authMiddleware('collector'), getScanHistory);

/**
 * @swagger
 * /api/scan/{scanId}:
 *   get:
 *     summary: Récupérer les détails d'un scan spécifique
 *     tags: [Collectes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scanId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du scan
 *     responses:
 *       200:
 *         description: Détails du scan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scan:
 *                   type: object
 *       404:
 *         description: Scan introuvable
 */
router.get('/:scanId', authMiddleware('collector'), getScanDetails);

export default router;