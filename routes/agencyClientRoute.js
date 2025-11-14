const express = require('express');
const router = express.Router();
const AgencyClientController = require('../controllers/agencyClient');

/**
 * @swagger
 * tags:
 *   name: Agency Clients
 *   description: Gestion des clients abonnés à une agence
 */

/**
 * @swagger
 * /api/agency_clients/{agencyId}/subscribed-clients:
 *   get:
 *     summary: Récupérer les clients abonnés à une agence
 *     description: |
 *       Retourne la liste de tous les clients qui ont une **subscription active** liée à une agence.
 *     tags: [Agency Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agence
 *     responses:
 *       200:
 *         description: Clients abonnés récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       client:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           status:
 *                             type: string
 *                       subscriptionId:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                       numberMonths:
 *                         type: number
 *       400:
 *         description: Identifiant de l'agence manquant
 *       404:
 *         description: Aucun client trouvé pour cette agence
 *       500:
 *         description: Erreur serveur
 */
router.get('/:agencyId/subscribed-clients', AgencyClientController.getSubscribedClients);

module.exports = router;
