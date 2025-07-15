import express from 'express';
import { updateProfile } from '../controllers/profileController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profil
 *   description: Gestion des profils utilisateurs
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token JWT à utiliser dans le header Authorization "Bearer <token>"
 *   schemas:
 *     ClientUpdate:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: Jean
 *         lastName:
 *           type: string
 *           example: Dupont
 *         phone:
 *           type: string
 *           example: "+22670123456"
 *         agencyId:
 *           type: array
 *           items:
 *             type: string
 *         subscribedAgencyId:
 *           type: string
 *         subscriptionStatus:
 *           type: string
 *           enum: [active, pending, cancelled]
 *         serviceAddress:
 *           type: object
 *           properties:
 *             region: { type: string }
 *             province: { type: string }
 *             commune: { type: string }
 *             arrondissement: { type: string }
 *             secteur: { type: string }
 *             quartier: { type: string }
 *             rue: { type: string }
 *             porte: { type: string }
 *             couleurPorte: { type: string }
 *             coordinates:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   enum: [Point]
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: number
 *     AgencyUpdate:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         contactPerson: { type: string }
 *         phone: { type: string }
 *         licenseNumber: { type: string }
 *         description: { type: string }
 *         location:
 *           type: object
 *           properties:
 *             region: { type: string }
 *             province: { type: string }
 *             commune: { type: string }
 *             arrondissement: { type: string }
 *             secteur: { type: string }
 *             quartier: { type: string }
 *             rue: { type: string }
 *         coveredAreas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               region: { type: string }
 *               province: { type: string }
 *               commune: { type: string }
 *               arrondissement: { type: string }
 *               secteur: { type: string }
 *               quartier: { type: string }
 *         isVerified: { type: boolean }
 *     CollectorUpdate:
 *       type: object
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         phone: { type: string }
 *         agencyId: { type: string }
 *         assignedAreas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               region: { type: string }
 *               province: { type: string }
 *               commune: { type: string }
 *               arrondissement: { type: string }
 *               secteur: { type: string }
 *               quartier: { type: string }
 *         vehicleInfo:
 *           type: object
 *           properties:
 *             type: { type: string }
 *             plateNumber: { type: string }
 *         isManager: { type: boolean }
 *     MunicipalManagerUpdate:
 *       type: object
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         phone: { type: string }
 *         agencyId:
 *           type: array
 *           items:
 *             type: string
 *         commune:
 *           type: object
 *           properties:
 *             region: { type: string }
 *             province: { type: string }
 *             name: { type: string }
 *         managedZones:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               arrondissement: { type: string }
 *               secteur: { type: string }
 *               quartier: { type: string }
 *               village: { type: string }
 *         position:
 *           type: string
 *           example: Maire
 *
 * /api/profile/{userId}:
 *   put:
 *     summary: Met à jour le profil d’un utilisateur
 *     tags: [Profil]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/ClientUpdate'
 *               - $ref: '#/components/schemas/AgencyUpdate'
 *               - $ref: '#/components/schemas/CollectorUpdate'
 *               - $ref: '#/components/schemas/MunicipalManagerUpdate'
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profil mis à jour avec succès
 *                 profile:
 *                   type: object
 *                   description: Profil utilisateur mis à jour
 *       400:
 *         description: Rôle inconnu
 *       404:
 *         description: Utilisateur ou profil non trouvé
 *       500:
 *         description: Erreur serveur
 */

router.put('/profile/:userId', authMiddleware, updateProfile);

export default router;
