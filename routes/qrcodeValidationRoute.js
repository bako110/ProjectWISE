const express = require('express');
const router = express.Router();
const QRValidationController = require('../controllers/qrValidation');

/**
 * @swagger
 * tags:
 *   name: QR
 *   description: Routes pour la validation des QR Codes
 */

/**
 * @swagger
 * /qr/qr_validation/collector:
 *   post:
 *     summary: Valider un abonnement via QR Code
 *     tags: [QR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrData:
 *                 type: string
 *                 description: Données du QR Code scanné
 *                 example: '{"subscriptionId":"64f...","clientId":"64f..."}'
 *     responses:
 *       200:
 *         description: Abonnement validé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 clientName:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                 endDate:
 *                   type: string
 *       400:
 *         description: Données manquantes
 *       404:
 *         description: Abonnement ou utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/collector', QRValidationController.validate);

module.exports = router;
