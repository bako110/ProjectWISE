const express = require('express');
const router = express.Router();
const CollecteController = require('../controllers/qrValidation');

/**
 * @swagger
 * tags:
 *   name: Collectes
 *   description: Gestion des collectes et QR codes
 */

/**
 * @swagger
 * /api/collecte/scan:
 *   post:
 *     summary: Scanner un QR code et marquer la collecte comme collected
 *     tags: [Collectes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               collectorId:
 *                 type: string
 *             required:
 *               - code
 *               - collectorId
 *     responses:
 *       200:
 *         description: Collecte marquée comme collected
 *       400:
 *         description: Paramètres manquants
 *       500:
 *         description: Erreur serveur
 */
router.post('/scan', CollecteController.scanCollecte);

/**
 * @swagger
 * /api/collecte/agency/{agencyId}:
 *   get:
 *     summary: Récupérer toutes les collectes d'une agence
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'agence
 *     responses:
 *       200:
 *         description: Liste des collectes
 */
router.get('/agency/:agencyId', CollecteController.getCollectesByAgency);

/**
 * @swagger
 * /api/collecte/collector/{collectorId}:
 *   get:
 *     summary: Récupérer toutes les collectes d'un collecteur
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du collecteur
 *     responses:
 *       200:
 *         description: Liste des collectes
 */
router.get('/collector/:collectorId', CollecteController.getCollectesByCollector);

/**
 * @swagger
 * /api/collecte/all:
 *   get:
 *     summary: Récupérer toutes les collectes
 *     tags: [Collectes]
 *     responses:
 *       200:
 *         description: Liste de toutes les collectes
 */
router.get('/all', CollecteController.getAllCollectes);

module.exports = router;
