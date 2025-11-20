const express = require('express');
const router = express.Router();
const { getDashboardStats, getCollectorStatistics } = require('../controllers/globalSate');

/**
 * @swagger
 * tags:
 *   name: Statistiques
 *   description: API pour les statistiques de l'application
 */

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Récupère les statistiques globales (agents, clients, agences, adhésions mensuelles, collectes)
 *     tags: [Statistiques]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
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
 *                   example: "Statistiques du tableau de bord récupérées avec succès"
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalMunicipalityAgents:
 *                       type: integer
 *                       example: 3
 *                     totalManagers:
 *                       type: integer
 *                       example: 5
 *                     totalCollectors:
 *                       type: integer
 *                       example: 12
 *                     totalClients:
 *                       type: integer
 *                       example: 247
 *                     totalAgencies:
 *                       type: integer
 *                       example: 8
 *                     totalActiveAgencies:
 *                       type: integer
 *                       example: 6
 *                     totalInactiveAgencies:
 *                       type: integer
 *                       example: 2
 *                     totalDeletedAgencies:
 *                       type: integer
 *                       example: 0
 *                     agenciesByCity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           city:
 *                             type: string
 *                             example: "Ouagadougou"
 *                           numberOfAgencies:
 *                             type: integer
 *                             example: 3
 *                     clientsByCity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           city:
 *                             type: string
 *                             example: "Ouagadougou"
 *                           numberOfClients:
 *                             type: integer
 *                             example: 120
 *                     collectionsByCity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           city:
 *                             type: string
 *                             example: "Ouagadougou"
 *                           numberOfCollections:
 *                             type: integer
 *                             example: 250
 *                     monthlyClientSubscriptions:
 *                       type: integer
 *                       example: 21
 *                     monthlyClientPercentage:
 *                       type: number
 *                       example: 8.5
 *                     totalCollections:
 *                       type: integer
 *                       example: 450
 *                     dailyCollections:
 *                       type: integer
 *                       example: 15
 *                     monthlyCollections:
 *                       type: integer
 *                       example: 120
 *       500:
 *         description: Erreur serveur
 */
router.get('/', getDashboardStats);

/**
 * @swagger
 * /api/statistics/collector/{collectorId}:
 *   get:
 *     summary: Récupérer les statistiques d'un collecteur spécifique
 *     tags: [Statistiques]
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du collecteur
 *     responses:
 *       200:
 *         description: Statistiques du collecteur récupérées avec succès
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
 *                   example: "Statistiques du collecteur récupérées avec succès"
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalCollectes:
 *                       type: integer
 *                       example: 120
 *                     totalScheduledCollectes:
 *                       type: integer
 *                       example: 200
 *                     totalCollectedCollectes:
 *                       type: integer
 *                       example: 8
 *                     totalReportedCollectes:
 *                       type: integer
 *                       example: 6
 *       500:
 *         description: Erreur serveur
 */
router.get('/collector/:collectorId', getCollectorStatistics);

module.exports = router;
