import express from 'express';
import { 
  scanBarrel, 
  getScanReports, 
  regenerateQRCode,
  getScanHistory,
  getAgencyPercentage
} from '../../controllers/agency/scanController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
// import { protect, adminOnly } from '../../middlewares/authMiddleware.js';

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
 *     description: |
 *       - Retourne **les infos du client** associé au QR code.
 *       - Cette route est appelée lorsqu’on **scanne** un QR code (GET avec `id` ou `clientId`).
 *     tags: [Collecte]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: ID du client (reçu via le QR code)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Infos du client récupérées avec succès
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
 * /api/collecte/scan/validate:
 *   post:
 *     summary: Valider une collecte
 *     description: |
 *       - Après avoir scanné un QR code (GET), l’utilisateur peut cliquer sur **Valider** dans l’UI.
 *       - Cette route enregistre uniquement la **collecte validée**.
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
 *               positionGPS:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       201:
 *         description: Collecte validée
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Client introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post('/scan/validate', authMiddleware(), scanBarrel);

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
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/reports', getScanReports);

/**
 * @swagger
 * /api/collecte/regenerate/{clientId}:
 *   put:
 *     summary: Régénérer un QR code pour un client
 *     description: Permet à un client (ou un admin) de régénérer son QR code
 *     tags: [Collecte]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client
 *     responses:
 *       200:
 *         description: QR code régénéré avec succès
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Client introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/regenerate/:clientId',  regenerateQRCode);

/**
 * @swagger
 * /api/collecte/{collectorId}historique:
 *   get:
 *     summary: Récupérer l'historique des collectes
 *     tags: [Collecte]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des collectes
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/:collectrId/historique', getScanHistory);

/**
 * @swagger
 * /api/collecte/percentage/{agencyId}:
 *   get:
 *     summary: Calculer le pourcentage des collectes d'une agence sur le total
 *     description: Retourne le nombre total de collectes et le pourcentage d'une agence donnée.
 *     tags:
 *       - ScanReports
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         description: L'ID de l'agence
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pourcentage des collectes d'une agence
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agencyId:
 *                   type: string
 *                   example: "653c4b9ff20325daaaa12345"
 *                 agenceCollectes:
 *                   type: integer
 *                   example: 50
 *                 totalCollectes:
 *                   type: integer
 *                   example: 200
 *                 pourcentage:
 *                   type: string
 *                   example: "25.00%"
 *       500:
 *         description: Erreur serveur
 */
router.get('/percentage/:agencyId', getAgencyPercentage);


export default router;
