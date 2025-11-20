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
 * /api/agency_employees/{agencyId}/employees:
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
 *
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         description: Recherche textuelle (nom, email, téléphone)
 *
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrer par ville
 *
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Filtrer par quartier
 * 
 *       - in: query
 *         name: arrondissement
 *         schema:
 *           type: string
 *         description: Filtrer par arrondissement
 *
 *       - in: query
 *         name: sector
 *         schema:
 *           type: number
 *         description: Filtrer par sector
 * 
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrer par role (manager, gestionnaire, collector)
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre de résultats par page
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de la page
 *
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
 * /api/agency_employees/{agencyId}/collectors:
 *   get:
 *     summary: Récupérer les collectors d'une agence
 *     description: Renvoie la liste des collectors actifs avec filtres et pagination.
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
 *
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         description: Recherche textuelle (nom, email, téléphone)
 *
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrer par ville
 *
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Filtrer par quartier
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre de résultats par page
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de la page
 *
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

/**
 * @swagger
 * /api/agency_employees/{agencyId}/clients:
 *   get:
 *     summary: Récupérer les clients d'une agence
 *     description: Renvoie les clients actifs avec filtres et pagination.
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
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         description: Recherche textuelle (nom, email, téléphone)
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrer par ville
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Filtrer par quartier
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre de résultats par page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page courante
 *     responses:
 *       200:
 *         description: Liste des clients récupérée avec succès
 *       400:
 *         description: ID de l'agence manquant
 *       500:
 *         description: Erreur serveur
 */

router.get('/:agencyId/clients', AgencyEmployeeController.getClientsByAgency);

module.exports = router;
