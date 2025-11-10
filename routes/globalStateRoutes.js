const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/globalSate');

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
 *     summary: Récupère les statistiques globales (agents, clients, agences, adhésions mensuelles)
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
 *                     monthlyClientSubscriptions:
 *                       type: integer
 *                       example: 21
 *       500:
 *         description: Erreur serveur
 */
router.get('/', getDashboardStats);

module.exports = router;
