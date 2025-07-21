import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { scanBarrel } from '../../controllers/agency/scanController.js';

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
 *     summary: Valider un scan de barrique
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
 *               status:
 *                 type: string
 *                 enum: [collected, problem]
 *                 description: |
 *                   'collected' signifie que la collecte s'est bien déroulée,  
 *                   'problem' signifie qu'un problème a été rencontré (un commentaire est alors requis)
 *               comment:
 *                 type: string
 *                 description: Commentaire décrivant le problème (obligatoire si status = 'problem')
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste d'URLs ou chemins des photos illustrant le problème
 *               positionGPS:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     description: Latitude du lieu de la collecte
 *                   lng:
 *                     type: number
 *                     description: Longitude du lieu de la collecte
 *     responses:
 *       201:
 *         description: Scan enregistré avec succès
 *       400:
 *         description: Données invalides (ex: absence de clientId ou commentaire manquant si problème)
 *       401:
 *         description: Non autorisé (token invalide ou rôle incorrect)
 *       500:
 *         description: Erreur serveur
 */
router.post('/qr-code', authMiddleware('collector'), scanBarrel);

export default router;
