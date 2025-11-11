const express = require('express');
const router = express.Router();
const QRValidationController = require('../controllers/qrValidation');

/**
 * @swagger
 * tags:
 *   name: QRCollection
 *   description: Gestion des collectes via QR Code
 */

/**
 * @swagger
 * /qr/qr_validation/collect:
 *   post:
 *     summary: Marquer une collecte via QR Code
 *     tags: [QRCollection]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrData:
 *                 type: string
 *               collectorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Collecte enregistrée
 *       400:
 *         description: Données manquantes
 *       404:
 *         description: Abonnement ou utilisateur non trouvé
 */
router.post('/qr_validation/collect', QRValidationController.collect);

/**
 * @swagger
 * /qr/qr_validation/history/{collectorId}:
 *   get:
 *     summary: Récupérer l'historique des collectes d'un collecteur
 *     tags: [QRCollection]
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du collecteur
 *     responses:
 *       200:
 *         description: Historique des collectes
 */
router.get('/qr_validation/history/:collectorId', QRValidationController.history);

module.exports = router;
