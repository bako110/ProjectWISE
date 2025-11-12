const express = require('express');
const router = express.Router();
const { collecteController } = require('../controllers/collecte.controller.js');

/**
 * @swagger
 * tags:
 *   name: Collectes
 *   description: API pour gérer les collectes
 */

/**
 * @swagger
 * api/collectes/user/{userId}/collecte-history:
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
router.get('/user/:userId/collecte-history', collecteController.UserCollecteHistory);

/**
 * @swagger
 * api/collectes/user/{userId}/collecte-reporting:
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
router.get('/user/:userId/collecte-reporting', collecteController.userCollecteReporting);

/**
 * @swagger
 * api/collectes/user/{userId}/scheduled-collectes:
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
 *     responses:
 *       200:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Collecte'
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:userId/scheduled-collectes', collecteController.UserScheduledCollectes);

/**
 * @swagger
 * api/collectes/agency/{agencyId}/collectes:
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
router.get('/agency/:agencyId/collectes', collecteController.AgencyCollectes);

/**
 * @swagger
 * api/collectes/agency/{agencyId}/completed-collectes:
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
router.get('/agency/:agencyId/completed-collectes', collecteController.AgencyCompletedCollectes);

/**
 * @swagger
 * api/collectes/agency/{agencyId}/reporting-collectes:
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
router.get('/agency/:agencyId/reporting-collectes', collecteController.AgencyReportingCollectes);

/**
 * @swagger
 * api/collectes/collector/{collectorId}/collectes:
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
router.get('/collector/:collectorId/collectes', collecteController.CollectorCollectes);

/**
 * @swagger
 * api/collectes/collector/{collectorId}/reporting-collectes:
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
router.get('/collector/:collectorId/reporting-collectes', collecteController.CollectorReportingCollectes);

/**
 * @swagger
 * api/collectes/collector/{collectorId}/completed-collectes:
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
router.get('/collector/:collectorId/completed-collectes', collecteController.CollectorCompletedCollectes);

module.exports = router;