import express from 'express';
import { createEmployee } from '../../controllers/agency/AdminCreateEmpController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import { createTarif, updateTarif, getTarifByAgency, getTarifById, deleteTarif, getAllTarifs } from '../../controllers/tarifController.js';
import {
  getAllAgencies,
  getAgencyById
} from '../../controllers/authController.js';
import { getEmployee, getAllEmployees, getEmployeeByRoleAndAgency, statistics, updateEmployee } from '../../controllers/agency/AdminCreateEmpController.js';

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
 * /api/agences/employees/{id}:
 *   put:
 *    summary: Mettre à jour un employé par ID
 *     tags:
 *      - Employés
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *       name: id
 *        required: true
 *         schema:
 *          type: string
 *        description: ID de l'employé à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                type: string
 *                 example: Marie
 *               lastname:
 *                 type: string
 *                 example: Curie
 *               email:
 *                 type: string
 *                 format: email
 *                 example:marie.cuirie@example.com
 *               phone:
 *                 type: string
 *                 example: "+22670707070"
 *               role:
 *                 type: string
 *                 enum:
 *                   - manager 
 *                   - collector
 *                 example: collector
 *     responses:
 *       200:
 *         description: Employé mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Employé mis à jour avec succès
 *                 employee:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60c72b2f5f1b2c001c8d4e0b
 *                     firstname:  
 *                       type: string
 *                       example: Marie
 *                     lastname:
 *                       type: string
 *                       example: Curie
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: string
 *                     phone:
 *                       type: string
 *                       example: "+22670707070"
 *                     role:
 *                       type: string
 *                       enum:
 *                         - manager
 *                         - collector
 *                       example: collector
 *                     isActive:
 *                       type: boolean 
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-21T12:34:56Z"
 *       400:
 *          description: ID invalide ou données manquantes
 *       404:
 *         description: Employé non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/employees/:id', authMiddleware('agency'), updateEmployee);

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
 *         description: Rôle de l'employé
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


/**
 * @swagger
 * /api/agences/tarif:
 *   post:
 *     summary: Créer un tarif
 *     tags:
 *       - Tarifs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agencyId
 *               - type
 *               - price
 *             properties:
 *               agencyId:
 *                 type: string
 *                 description: ID de l'agence
 *               type:
 *                 type: string
 *                 enum: [standard, premium, enterprise]
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               nbPassages:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tarif créé avec succès
 *       400:
 *         description: Requête invalide
 *       500:
 *         description: Erreur serveur
 */

router.post('/tarif',authMiddleware('agency'), createTarif);

/**
 * @swagger
 * /api/agences/tarif/{tarifId}:
 *   put:
 *     summary: Mettre à jour un tarif
 *     tags:
 *       - Tarifs
 *     parameters:
 *       - in: path
 *         name: tarifId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du tarif à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - price
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [standard, premium, enterprise]
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               nbPassages:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tarif mis à jour avec succès
 *       404:
 *         description: Tarif non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/tarif/:tarifId', authMiddleware('agency'), updateTarif);

/**
 * @swagger
 * /api/agences/{agencyId}/tarif:
 *   get:
 *     summary: Récupérer les tarifs d'une agence
 *     tags:
 *       - Tarifs
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         description: ID de l'agence
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des tarifs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarif'
 *       404:
 *         description: Aucun tarif trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:agencyId/tarif', authMiddleware('agency'), getTarifByAgency);

/**
 * @swagger
 * /api/agences/tarif/{tarifId}:
 *   get:
 *     summary: Récupérer un tarif par ID
 *     tags:
 *       - Tarifs
 *     parameters:
 *       - in: path
 *         name: tarifId
 *         required: true
 *         description: ID du tarif à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du tarif récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarif'
 *       404:
 *         description: Tarif non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/tarif/:tarifId', authMiddleware('agency'), getTarifById);

/**
 * @swagger
 * /api/agences/tarif/{tarifId}:
 *   delete:
 *     summary: Supprimer un tarif par ID
 *     tags:
 *       - Tarifs
 *     parameters:
 *       - in: path
 *         name: tarifId
 *         required: true
 *         description: ID du tarif à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarif supprimé avec succès
 *       404:
 *         description: Tarif non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/tarif/:tarifId', authMiddleware('agency'), deleteTarif);

/**
 * @swagger
 * /api/agences/tarifs:
 *   get:
 *     summary: Récupérer tous les tarifs
 *     tags:
 *       - Tarifs
 *     responses:
 *       200:
 *         description: Liste de tous les tarifs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarif'
 *       500:
 *         description: Erreur serveur
 */
router.get('/tarifs', authMiddleware('agency'), getAllTarifs);

/**
 * @swagger
 * /api/agences/{agencyId}/statistiques:
 *   get:
 *     summary: Récupérer les statistiques d'une agence
 *     tags: [Agences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agence pour laquelle récupérer les statistiques
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       404:
 *         description: Agence non trouvée
 */
router.get('/:agencyId/statistiques', authMiddleware('agency'), statistics);

export default router;
