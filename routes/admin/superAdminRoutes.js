import express from 'express';
import { registerSuperAdmin } from '../../controllers/admin/adminControllers.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/register-super-admin:
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
 *                 example: ma_clef_secrete_superadmin
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

export default router;
