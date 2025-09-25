import express from "express";
import multer from "multer";
import { storage } from "../../config/cloudinaryConfig.js";
const upload = multer({ storage });
import {
  createReport,
  getReportsByAgency,
  getReportsByClient,
  getReportsByCollector,
  updateReportStatus, 
  getAllReports,
  assignEmployeeToReport
} from "../../controllers/report/reportController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       required:
 *         - _id
 *         - agency
 *         - type
 *         - description
 *         - status
 *         - createdAt
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique du signalement
 *         client:
 *           type: string
 *           description: ID du client (optionnel)
 *         collector:
 *           type: string
 *           description: ID du collecteur (optionnel)
 *         agency:
 *           type: string
 *           description: ID de l'agence
 *         type:
 *           type: string
 *           description: Type de signalement
 *         description:
 *           type: string
 *           description: Détails du signalement
 *         status:
 *           type: string
 *           description: Statut du signalement (pending par défaut)
 *           enum: [pending, resolved]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du signalement
 */

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Gestion des signalements (clients, collecteurs, agences)
 */

/**
 * @swagger
 * /api/reports/all:
 *   get:
 *     summary: Récupérer tous les signalements de toutes les agences
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Liste complète des signalements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 */
router.get("/all", getAllReports);

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Créer un signalement (client ou collecteur)
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agencyId
 *               - type
 *               - description
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: ID du client (optionnel, soit client soit collecteur obligatoire)
 *               collectorId:
 *                 type: string
 *                 description: ID du collecteur (optionnel, soit client soit collecteur obligatoire)
 *               agencyId:
 *                 type: string
 *                 description: ID de l'agence
 *               type:
 *                 type: string
 *                 description: Type de signalement
 *               description:
 *                 type: string
 *                 description: Description détaillée
 *     responses:
 *       201:
 *         description: Signalement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: Erreur de validation (client ou collecteur obligatoire, type, description et agency requis)
 */
router.post("/",upload.single('wise'), createReport);

/**
 * @swagger
 * /api/reports/agency/{agencyId}:
 *   get:
 *     summary: Récupérer tous les signalements d’une agence
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des signalements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 */
router.get("/agency/:agencyId", getReportsByAgency);

/**
 * @swagger
 * /api/reports/client/{clientId}:
 *   get:
 *     summary: Récupérer les signalements d’un client
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des signalements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 */
router.get("/client/:clientId", getReportsByClient);

/**
 * @swagger
 * /api/reports/collector/{collectorId}:
 *   get:
 *     summary: Récupérer les signalements d’un collecteur
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des signalements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 */
router.get("/collector/:collectorId", getReportsByCollector);

/**
 * @swagger
 * /api/reports/{reportId}/status:
 *   patch:
 *     summary: Mettre à jour le statut d’un signalement
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, resolved]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 */

/**
 * @swagger
 * /api/reports/{reportId}/assign:
 *   put:
 *     summary: Assigner un employé (collecteur) à un signalement
 *     description: Permet d'assigner un employé collecteur à un signalement existant et de mettre à jour le statut.
 *     tags: 
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reportId
 *         in: path
 *         required: true
 *         description: ID du signalement à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: ID de l'employé à assigner
 *                 example: 64c5a7f8e2e8c5e8d3f1a123
 *               status:
 *                 type: string
 *                 description: Nouveau statut du signalement
 *                 example: in_progress
 *     responses:
 *       200:
 *         description: Employé assigné avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ✅ Employé assigné avec succès au signalement.
 *                 report:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 652f1234abcd5678ef901234
 *                     status:
 *                       type: string
 *                       example: in_progress
 *                     collector:
 *                       type: string
 *                       example: Alice Traoré
 *       400:
 *         description: Paramètres invalides ou manquants
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Signalement ou employé introuvable
 */

router.put('/:reportId/assign', assignEmployeeToReport);
router.post("/", upload.single('wise'), createReport);
router.get("/agency/:agencyId", getReportsByAgency);
router.get("/client/:clientId", getReportsByClient);
router.get("/collector/:collectorId", getReportsByCollector);
router.patch("/:reportId/status", updateReportStatus);


export default router;
