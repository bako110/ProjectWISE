import express from 'express';
import { createEmployee } from '../../controllers/agency/AdminCreateEmpController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import {
  getAllAgencies,
  getAgencyById
} from '../../controllers/authController.js';
import { getEmployee, getAllEmployees, getEmployeeByRoleAndAgency } from '../../controllers/agency/AdminCreateEmpController.js';

const router = express.Router();

/**
 * @swagger
 * /api/agences/employees:
 *   post:
 *     summary: Création d'un employé (collector ou manager) par une agence
 *     tags:
 *       - Employés
 *     security:
 *       - bearerAuth: []
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
 *               - role
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: Marie
 *               lastname:
 *                 type: string
 *                 example: Curie
 *               email:
 *                 type: string
 *                 format: email
 *                 example: marie.curie@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: motdepasse123
 *               role:
 *                 type: string
 *                 enum:
 *                   - manager
 *                   - collector
 *                 example: collector
 *     responses:
 *       201:
 *         description: Employé créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Employé créé avec succès
 *                 employeeId:
 *                   type: string
 *                   example: 60c72b2f5f1b2c001c8d4e0b
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Données invalides ou champs manquants
 *       401:
 *         description: Non autorisé (token manquant ou rôle incorrect)
 *       500:
 *         description: Erreur serveur
 */
router.post('/employees', authMiddleware('agency'), createEmployee);

/**
 * @swagger
 * /api/agences/recuperation:
 *   get:
 *     summary: Récupérer la liste de toutes les agences
 *     tags:
 *       - Agences
 *     responses:
 *       200:
 *         description: Liste des agences récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 agences:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60c72b2f5f1b2c001c8d4e0b
 *                       nom:
 *                         type: string
 *                         example: Agence Yennega
 *                       email:
 *                         type: string
 *                         example: contact@yennega.com
 *                       telephone:
 *                         type: string
 *                         example: "+22670707070"
 *       500:
 *         description: Erreur lors de la récupération des agences
 */
router.get('/recuperation', getAllAgencies);

/**
 * @swagger
 * /api/agences/recuperation/{id}:
 *   get:
 *     summary: Récupérer une agence par son ID
 *     tags:
 *       - Agences
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unique de l'agence
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'agence récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 agence:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60c72b2f5f1b2c001c8d4e0b
 *                     nom:
 *                       type: string
 *                       example: Agence Yennega
 *                     email:
 *                       type: string
 *                       example: contact@yennega.com
 *                     telephone:
 *                       type: string
 *                       example: "+22670707070"
 *       404:
 *         description: Aucune agence trouvée avec cet ID
 *       500:
 *         description: Erreur serveur lors de la récupération
 */
router.get('/recuperation/:id', getAgencyById);


/**
 * @swagger
 * /api/agences/{agencyId}/employees/{id}:
 *   get:
 *     summary: Récupérer un employé spécifique par ID
 *     tags:
 *       - Employés
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         description: ID de l'agence
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'employé
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employé récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employé non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:agencyId/employees/:id', authMiddleware('agency'), getEmployee);

/**
 * @swagger
 * /api/agences/{agencyId}/employees:
 *   get:
 *     summary: Récupérer tous les employés d'une agence
 *     tags:
 *       - Employés
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         description: ID de l'agence
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des employés récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 *       500:
 *         description: Erreur serveur
 */

router.get('/:agencyId/employees', authMiddleware('agency'), getAllEmployees);


/**
 * @swagger
 * /api/agences/{agencyId}/employees/role/{role}:
 *   get:
 *     summary: Récupérer les employés d'une agence par rôle
 *     tags:
 *       - Employés
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         description: ID de l'agence
 *         schema:
 *           type: string
 *       - in: path
 *         name: role
 *         required: true
 *         description: Rôle de l'employé (ex: livreur, manager)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employés filtrés par rôle
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 *       500:
 *         description: Erreur serveur
 */
router.get('/:agencyId/employees/role/:role', authMiddleware('agency'), getEmployeeByRoleAndAgency);



export default router;
