import express from 'express';
import { scanBarrel } from '../../controllers/agency/scanController.js';
// import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route GET /api/collecte/scan
 * @desc Validation automatique via scan de QR code contenant l'ID
 * @access Public (ou protégé selon ton choix)
 */
router.get('/scan',  scanBarrel); // ⚠️ GET avec ?id=xxxxx

/**
 * @route POST /api/collecte/scan
 * @desc Signalement manuel ou automatique (clientId + infos)
 * @access Authentifié
 */
router.post('/scan',  scanBarrel);

export default router;











// import express from 'express';
// import { scanBarrel } from '../../controllers/agency/scanController.js';
// import authMiddleware from '../../middlewares/authMiddleware.js';

// const router = express.Router();

// /**
//  * @swagger
//  * /api/collecte/scan:
//  *   post:
//  *     summary: Signaler automatiquement le passage d'un collecteur via scan QR
//  *     tags:
//  *       - Collecte
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       description: Données pour signaler la collecte ou un problème
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - clientId
//  *             properties:
//  *               clientId:
//  *                 type: string
//  *                 description: Identifiant MongoDB du client scanné
//  *                 example: 64f3e9b3e1f7c0123456789a
//  *               status:
//  *                 type: string
//  *                 enum: [collected, problem]
//  *                 default: collected
//  *                 description: Statut de la collecte
//  *               comment:
//  *                 type: string
//  *                 description: Commentaire obligatoire si status = problem
//  *               photos:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                 description: URLs ou base64 des photos en cas de problème
//  *               positionGPS:
//  *                 type: object
//  *                 properties:
//  *                   lat:
//  *                     type: number
//  *                     example: 12.345678
//  *                   lng:
//  *                     type: number
//  *                     example: -7.123456
//  *                 description: Coordonnées GPS facultatives
//  *     responses:
//  *       201:
//  *         description: Collecte ou problème signalé avec succès
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: Collecte validée avec succès
//  *                 report:
//  *                   type: object
//  *                   properties:
//  *                     id:
//  *                       type: string
//  *                     client:
//  *                       type: object
//  *                       properties:
//  *                         firstName:
//  *                           type: string
//  *                         lastName:
//  *                           type: string
//  *                         phone:
//  *                           type: string
//  *                     collector:
//  *                       type: object
//  *                       properties:
//  *                         firstName:
//  *                           type: string
//  *                         lastName:
//  *                           type: string
//  *                     agency:
//  *                       type: object
//  *                       properties:
//  *                         agencyName:
//  *                           type: string
//  *                     status:
//  *                       type: string
//  *                     scannedAt:
//  *                       type: string
//  *                       format: date-time
//  *                     comment:
//  *                       type: string
//  *                     photos:
//  *                       type: array
//  *                       items:
//  *                         type: string
//  *                     positionGPS:
//  *                       type: object
//  *                       properties:
//  *                         lat:
//  *                           type: number
//  *                         lng:
//  *                           type: number
//  *       400:
//  *         description: "Erreur de validation (clientId manquant ou invalide)"
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   example: "ClientId invalide ou manquant."
//  *       401:
//  *         description: Non authentifié
//  *       404:
//  *         description: Client non trouvé
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   example: "Client introuvable."
//  *       500:
//  *         description: Erreur serveur interne
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 error:
//  *                   type: string
//  *                   example: "Erreur serveur interne."
//  */

// router.post('/scan', authMiddleware, scanBarrel);

// export default router;