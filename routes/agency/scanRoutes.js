import express from 'express';
import { scanBarrel, getScanReports } from '../../controllers/agency/scanController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Collecte
 *   description: Gestion des scans de collecte (QR Code, rapports)
 */

/**
 * @swagger
 * /api/collecte/scan:
 *   get:
 *     summary: Scanner un QR code de collecte (via lien)
 *     description: Permet de valider une collecte automatiquement en scannant un QR code (GET avec `id`)
 *     tags: [Collecte]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: ID du client (reçu via le QR code)
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Collecte validée avec succès
 *       400:
 *         description: Paramètre manquant ou invalide
 *       404:
 *         description: Client introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/scan', scanBarrel);

/**
 * @swagger
 * /api/collecte/scan:
 *   post:
 *     summary: Signaler manuellement une collecte ou un problème
 *     description: Permet à un employé authentifié de signaler une collecte ou un problème.
 *     tags: [Collecte]
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
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: ID MongoDB du client
 *               status:
 *                 type: string
 *                 enum: [collected, problem]
 *                 default: collected
 *                 description: Statut de la collecte
 *               comment:
 *                 type: string
 *                 description: Commentaire si status = "problem"
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Photos en base64 ou URL
 *               positionGPS:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       201:
 *         description: Collecte ou problème enregistré
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Client introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post('/scan', authMiddleware, scanBarrel);

/**
 * @swagger
 * /api/collecte/reports:
 *   get:
 *     summary: Récupérer la liste des collectes
 *     description: |
 *       📍 **Filtrage des rapports disponibles :**
 *       
 *       - ✅ Collectes d’une agence : `/api/collecte/reports?agencyId=64f3e9b3e1f7c0123456789a`  
 *       - ✅ Collectes d’un client : `/api/collecte/reports?clientId=687fde0338944afafc1e0f3e`  
 *       - ✅ Collectes d’un employé : `/api/collecte/reports?collectorId=5f9d88cfe1f7c05f12345678`  
 *       - ✅ Tous les rapports (admin) : `/api/collecte/reports`
 *     tags: [Collecte]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: agencyId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID de l'agence
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID du client
 *       - in: query
 *         name: collectorId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID du collecteur (employé)
 *     responses:
 *       200:
 *         description: Liste des rapports de collecte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 reports:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       client:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           phone:
 *                             type: string
 *                       collector:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                       agency:
 *                         type: object
 *                         properties:
 *                           agencyName:
 *                             type: string
 *                       status:
 *                         type: string
 *                       scannedAt:
 *                         type: string
 *                         format: date-time
 *                       comment:
 *                         type: string
 *                       photos:
 *                         type: array
 *                         items:
 *                           type: string
 *                       positionGPS:
 *                         type: object
 *                         properties:
 *                           lat:
 *                             type: number
 *                           lng:
 *                             type: number
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/reports', authMiddleware, getScanReports);

export default router;
