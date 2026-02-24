const express = require('express');
const router = express.Router();
const { collecteController } = require('../controllers/collecte.controller.js');
const authMiddleware = require('../middlewares/auth.js');

/**
 * @swagger
 * tags:
 *   name: Collectes
 *   description: API pour gérer les collectes
 */

/**
 * @swagger
 * /api/collectes/user/{userId}/collecte-history:
 *   get:
 *     summary: Récupérer l'historique des collectes d'un utilisateur
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Collecte'
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:userId/collecte-history', authMiddleware(), collecteController.UserCollecteHistory);

/**
 * @swagger
 * /api/collectes/user/{userId}/collecte-reporting:
 *   get:
 *     summary: Récupérer les collectes en reporting d'un utilisateur
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Collecte'
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:userId/collecte-reporting', authMiddleware(), collecteController.userCollecteReporting);

/**
 * @swagger
 * /api/collectes/user/{userId}/scheduled-collectes:
 *   get:
 *     summary: Récupérer les collectes planifiées d'un utilisateur
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (filtre sur createdAt)
 *
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (filtre sur createdAt)
 *     responses:
 *       200:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Collecte'
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:userId/scheduled-collectes', authMiddleware(), collecteController.UserScheduledCollectes);

/**
 * @swagger
 * /api/collectes/agency/{agencyId}/collectes:
 *   get:
 *     summary: Récupérer toutes les collectes d'une agence
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agence
 *     responses:
 *       200:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Collecte'
 *       500:
 *         description: Erreur serveur
 */
router.get('/agency/:agencyId/collectes', authMiddleware(), collecteController.AgencyCollectes);

/**
 * @swagger
 * /api/collectes/agency/{agencyId}/completed-collectes:
 *   get:
 *     summary: Récupérer toutes les collectes terminées d'une agence
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agence
 *     responses:
 *       200:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Collecte'
 *       500:
 *         description: Erreur serveur
 */
router.get('/agency/:agencyId/completed-collectes', authMiddleware(), collecteController.AgencyCompletedCollectes);

/**
 * @swagger
 * /api/collectes/agency/{agencyId}/reporting-collectes:
 *   get:
 *     summary: Récupérer toutes les collectes en reporting d'une agence
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agence
 *     responses:
 *       200:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Collecte'
 *       500:
 *         description: Erreur serveur
 */
router.get('/agency/:agencyId/reporting-collectes', authMiddleware(), collecteController.AgencyReportingCollectes);

/**
 * @swagger
 * /api/collectes/collector/{collectorId}/collectes:
 *   get:
 *     summary: Récupérer toutes les collectes d'un collecteur
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du collecteur
 *     responses:
 *       200:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Collecte'
 *       500:
 *         description: Erreur serveur
 */
router.get('/collector/:collectorId/collectes', authMiddleware(), collecteController.CollectorCollectes);


/**
 * @swagger
 * /api/collectes/{collecteId}/report/{userId}:
 *   patch:
 *     summary: Signaler une collecte (status passe à "Reported")
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: collecteId
 *         required: true
 *         description: ID de la collecte à signaler
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur qui signale la collecte (client ou collecteur)
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Commentaires et/ou photos pour le signalement
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Problème constaté lors de la collecte"
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["urlPhoto1.jpg", "urlPhoto2.jpg"]
 *     responses:
 *       200:
 *         description: Collecte signalée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "La collecte a été signalée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Collecte'
 *       400:
 *         description: Erreur lors du signalement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "L'ID de la collecte est requis"
 */

router.patch('/:collecteId/report/:userId', authMiddleware(), collecteController.reportCollecte);


/**
 * @swagger
 * /api/collectes/collector/{collectorId}/reporting-collectes:
 *   get:
 *     summary: Récupérer toutes les collectes en reporting d'un collecteur
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du collecteur
 *     responses:
 *       200:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Collecte'
 *       500:
 *         description: Erreur serveur
 */
router.get('/collector/:collectorId/reporting-collectes', authMiddleware(), collecteController.CollectorReportingCollectes);

/**
 * @swagger
 * /api/collectes/collector/{collectorId}/completed-collectes:
 *   get:
 *     summary: Récupérer toutes les collectes terminées d'un collecteur
 *     tags: [Collectes]
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du collecteur
 *     responses:
 *       200:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Collecte'
 *       500:
 *         description: Erreur serveur
 */
router.get('/collector/:collectorId/completed-collectes', authMiddleware(), collecteController.CollectorCompletedCollectes);

module.exports = router;