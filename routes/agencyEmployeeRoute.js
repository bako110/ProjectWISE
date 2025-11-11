const express = require('express');
const router = express.Router();
const AgencyEmployeeController = require('../controllers/agencyEmployee');
// const protect = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Agency Employees
 *   description: Gestion des employés d'une agence
 */

/**
 * @swagger
 * /api/agencies/{agencyId}/employees:
 *   get:
 *     summary: Récupérer la liste des employés d'une agence
 *     description: |
 *       Renvoie la liste de tous les employés liés à une agence (owner, collector et gestionnaires).
 *       ⚠️ Accès réservé aux super admins et managers.
 *     tags: [Agency Employees]
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
 *         description: Liste des employés récupérée avec succès
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
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       role:
 *                         type: string
 *       400:
 *         description: ID de l'agence manquant
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle non autorisé)
 *       404:
 *         description: Agence non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:agencyId/employees', AgencyEmployeeController.getEmployees);

/**
 * @swagger
 * /api/agencies/{agencyId}/collectors:
 *   get:
 *     summary: Récupérer les collectors d'une agence
 *     description: Renvoie la liste de tous les collectors actifs liés à une agence.
 *     tags: [Agency Employees]
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
 *         description: Liste des collectors récupérée avec succès
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
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *       400:
 *         description: ID de l'agence manquant
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle non autorisé)
 *       404:
 *         description: Agence non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:agencyId/collectors', AgencyEmployeeController.getCollectorsByAgency);

module.exports = router;
