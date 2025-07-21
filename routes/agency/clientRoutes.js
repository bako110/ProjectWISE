// routes/agency/clientRoutes.js

import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import {
  getClientsByAgency,
  reportNoShow,
  validateClientSubscription
} from '../../controllers/agency/clientController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestion des clients liés aux agences
 */

/**
 * @swagger
 * /api/clients/agency/{agencyId}:
 *   get:
 *     summary: Liste des clients abonnés à une agence
 *     tags: [Clients]
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
 *         description: Liste des clients
 */
router.get('/agency/:agencyId', authMiddleware('agency'), getClientsByAgency);

/**
 * @swagger
 * /api/agences/clients/{clientId}/validate:
 *   put:
 *     summary: Valider la souscription d’un client à une agence
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client à valider
 *     responses:
 *       200:
 *         description: Souscription validée
 *       403:
 *         description: Accès interdit ou client lié à une autre agence
 *       404:
 *         description: Client ou agence non trouvé
 */
router.put('/clients/:clientId/validate', authMiddleware('agency'), validateClientSubscription);

/**
 * @swagger
 * /api/agences/clients/{id}/signalement:
 *   post:
 *     summary: Ajouter un signalement de non-passage par un client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "absence"
 *                 description: Type du signalement
 *               comment:
 *                 type: string
 *                 example: "Le camion n’est pas passé ce jour"
 *                 description: Commentaire associé au signalement
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-21T12:34:56Z"
 *                 description: Date du signalement (fourni par le client)
 *             required:
 *               - type
 *               - comment
 *               - date
 *     responses:
 *       200:
 *         description: Signalement enregistré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Report saved"
 *                 noShowReports:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       comment:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Client non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Client not found"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/clients/:id/signalement', authMiddleware('client'), reportNoShow);


export default router;
