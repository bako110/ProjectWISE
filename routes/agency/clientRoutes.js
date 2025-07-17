// routes/agency/clientRoutes.js
import express from 'express';
import auth from '../../middlewares/authMiddleware.js';
import { authorizeRoles } from '../../middlewares/agency/roleMiddleware.js';
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

/**
 * @swagger
 * /api/clients/{id}:
 *   patch:
 *     summary: Modifier le profil client (adresse, abonnement)
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
 *               serviceAddress:
 *                 type: object
 *               subscribedAgencyId:
 *                 type: string
 *               subscriptionStatus:
 *                 type: string
 *                 enum: [active, pending, cancelled]
 *     responses:
 *       200:
 *         description: Profil client mis à jour
 *       404:
 *         description: Client non trouvé
 */

/**
 * @swagger
 * /api/clients/{id}/signalement:
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

router.get('/clients/agency/:agencyId', auth('agence'), getClientsByAgency);
// router.patch('/clients/:id', auth, authorizeRoles('agence', 'client'), updateClientProfile);
router.post('/clients/:id/signalement', auth, authorizeRoles('client'), reportNonPassage);
router.put('/clients/:clientId/validate', auth('agence'), validateClientSubscription);

export default router;
