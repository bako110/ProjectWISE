// routes/agency/clientRoutes.js

import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import {
  getClientsByAgency,
  reportNonPassage,
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
router.get('/clients/agency/:agencyId', authMiddleware('agence'), getClientsByAgency);

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
router.put('/clients/:clientId/validate', authMiddleware('agence'), validateClientSubscription);

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
 *               comment:
 *                 type: string
 *                 example: "Le camion n’est pas passé ce jour"
 *     responses:
 *       200:
 *         description: Signalement enregistré
 *       404:
 *         description: Client non trouvé
 */
router.post('/clients/:id/signalement', authMiddleware('client'), reportNonPassage);

export default router;
