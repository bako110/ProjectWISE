import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import {
  getClientsByAgency,
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
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 *         description: Liste des clients abonnés à l'agence
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID du client
 *                   name:
 *                     type: string
 *                     description: Nom du client
 *                   email:
 *                     type: string
 *                     description: Email du client
 *                   subscriptionStatus:
 *                     type: string
 *                     description: Statut de la souscription
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Agence non trouvée
 */
router.get('/agency/:agencyId',/* authMiddleware('agency'),*/ getClientsByAgency);

/**
 * @swagger
 * /api/clients/{clientId}/validate:
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
 *         description: Souscription validée avec succès
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
 *                   example: Souscription validée
 *       403:
 *         description: Accès interdit ou client déjà lié à une autre agence
 *       404:
 *         description: Client non trouvé
 */
router.put('/:clientId/validate', authMiddleware('agency'), validateClientSubscription);

export default router;
