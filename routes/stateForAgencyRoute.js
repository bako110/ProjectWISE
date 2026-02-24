
const express = require('express');
const router = express.Router();
const AgencyStatsController = require('../controllers/stateForAgency');
const authMiddleware = require('../middlewares/auth.js');

/**
 * @swagger
 * tags:
 *   name: Agency Statistics
 *   description: API pour récupérer les statistiques des agences
 */

/**
 * @swagger
 * /api/state_agencies/{agencyId}/stats:
 *   get:
 *     summary: Récupérer les statistiques d'une agence
 *     description: Renvoie les informations statistiques d'une agence, incluant le nombre de clients actifs, de collecteurs et de gestionnaires.
 *     tags: [Agency Statistics]
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID unique de l'agence
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
 *                   example: Statistiques récupérées avec succès
 *                 data:
 *                   type: object
 *                   properties:
 *                     agencyId:
 *                       type: string
 *                       example: 674d1d0b83c93e2a0cb4b7ff
 *                     agencyName:
 *                       type: string
 *                       example: Agence Bobo-Centre
 *                     status:
 *                       type: string
 *                       example: active
 *                     totalClientsActifs:
 *                       type: integer
 *                       example: 45
 *                     totalCollecteurs:
 *                       type: integer
 *                       example: 10
 *                     totalGestionnaires:
 *                       type: integer
 *                       example: 3
 *       404:
 *         description: Agence non trouvée
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
 *                   example: Agence introuvable
 *       500:
 *         description: Erreur interne du serveur
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
 *                   example: Erreur lors de la récupération des statistiques
 */

router.get('/:agencyId/stats', AgencyStatsController.getStats);

module.exports = router;
