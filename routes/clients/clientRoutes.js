import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import {
  subscribeToAgency,
  getClientProfile,
  getClientById,
  getAllClients
} from '../../controllers/clients/clientController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Client
 *   description: Opérations liées au client (profil, abonnement)
 */

/**
 * @swagger
 * /api/clients/profile:
 *   get:
 *     summary: Obtenir le profil du client connecté
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du profil client récupérées avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 client:
 *                   $ref: '#/components/schemas/Client'
 *       401:
 *         description: Non autorisé. Token manquant ou invalide.
 */
router.get('/profile', authMiddleware, getClientProfile);

/**
 * @swagger
 * /api/clients/subscribe:
 *   post:
 *     summary: S'abonner à une agence
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agencyId
 *             properties:
 *               agencyId:
 *                 type: string
 *                 description: ID de l'agence à laquelle le client souhaite s'abonner
 *     responses:
 *       200:
 *         description: Abonnement effectué avec succès.
 *       400:
 *         description: Requête invalide ou agence introuvable.
 *       401:
 *         description: Non autorisé.
 */
router.post('/subscribe', authMiddleware('client'), subscribeToAgency);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Récupérer un client par son ID
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client à récupérer
 *     responses:
 *       200:
 *         description: Client récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: ID invalide.
 *       404:
 *         description: Client non trouvé.
 */
router.get('/:id', getClientById);

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Récupérer tous les clients (admin/agence)
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des clients récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 clients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 */
router.get('/', authMiddleware('super_admin', 'agency', 'manager'), getAllClients);

export default router;
