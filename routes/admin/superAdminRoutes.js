import express from 'express';
import { registerSuperAdmin, statistics, getAllEmployees} from '../../controllers/admin/adminControllers.js';
import { toggleAgencyStatus } from '../../controllers/admin/Agencystatus.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register-super-admin:
 *   post:
 *     summary: Création d'un super administrateur
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - password
 *               - superAdminKey
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: Jean
 *               lastname:
 *                 type: string
 *                 example: Dupont
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean.dupont@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: motdepasse123
 *               superAdminKey:
 *                 type: string
 *                 example: ma_clef_super_secret_1234
 *     responses:
 *       201:
 *         description: Super admin créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Super admin créé avec succès
 *                 userId:
 *                   type: string
 *                   example: 60c72b2f5f1b2c001c8d4e0b
 *                 role:
 *                   type: string
 *                   example: super_admin
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Erreur de validation des champs
 *       403:
 *         description: Clé secrète super admin invalide
 *       500:
 *         description: Erreur serveur
 */
router.post('/register-super-admin', registerSuperAdmin);


/**
 * @swagger
 * /api/auth/agences/{userId}/status:
 *   patch:
 *     summary: Activer ou désactiver une agence
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de l'utilisateur agence à modifier
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             example:
 *               message: "Statut de l'agence mis à jour avec succès."
 *               isActive: false
 *       404:
 *         description: Agence ou utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.patch('/agences/:userId/status', authMiddleware('super_admin'), toggleAgencyStatus);

/**
 * @swagger
 * /api/auth/statistics:
 *   get:
 *     summary: Récupérer les statistiques globales
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             example:
 *               totalAgence: 15
 *               activeAgence: 12
 *               totalMairie: 8
 *               totalClient: 250
 *               totalCollector: 20
 *               activeClient: 180
 *               totalCollection: 1200
 *               completeCollection: 950
 *               message: "Statistiques récupérées avec succès"
 *               success: true
 *       401:
 *         description: Non autorisé (accès refusé pour les rôles non super_admin)
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             example:
 *               message: "Erreur serveur lors de la récupération des statistiques"
 *               error: "SERVER_ERROR"
 */


router.get("/statistics", statistics);

/**
 * @swagger
 * /api/auth/employees/{role}:
 *   get:
 *     summary: Récupérer tous les employés par rôle
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [manager, collector]
 *         description: Le rôle des employés à récupérer (manager ou collector)
 *     responses:
 *       200:
 *         description: Liste des employés récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Liste des employés récupérée avec succès
 *                 employees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60c72b2f5f1b2c001c8d4e0b
 *                       firstName:
 *                         type: string
 *                         example: Jean
 *                       lastName:
 *                         type: string
 *                         example: Dupont
 *                       phone:
 *                         type: string
 *                         example: +1234567890
 *                       role:
 *                         type: string
 *                         enum: [manager, collector]
 *                         example: manager
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Aucun employé trouvé pour ce rôle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Aucun employé trouvé pour ce rôle.
 *                 error:
 *                   type: string
 *                   example: NO_EMPLOYEES_FOUND
 *       500:
 *         description: Erreur serveur lors de la récupération des employés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erreur serveur lors de la récupération des employés
 *                 error:
 *                   type: string
 *                   example: SERVER_ERROR
 */

router.get('/employees/:role', authMiddleware('super_admin'), getAllEmployees);

export default router;
