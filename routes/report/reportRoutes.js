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
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique du signalement
 *         client:
 *           type: string
 *           nullable: true
 *           description: ID du client ayant fait le signalement (optionnel)
 *         collector:
 *           type: string
 *           nullable: true
 *           description: ID du collecteur ayant fait le signalement (optionnel)
 *         agency:
 *           type: string
 *           description: ID de l'agence concernée
 *         type:
 *           type: string
 *           description: Type de signalement
 *         description:
 *           type: string
 *           description: Description détaillée du problème signalé
 *         severity:
 *           type: string
 *           enum: [low, medium, high]
 *           default: low
 *           description: Niveau de gravité du signalement
 *         status:
 *           type: string
 *           description: Statut du signalement
 *           example: pending
 *         photos:
 *           type: string
 *           nullable: true
 *           description: Chemin du fichier image (uploadé via le champ 'wise')
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du signalement
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
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
 *     summary: Créer un signalement (par un client ou un collecteur)
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - agencyId
 *               - type
 *               - description
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: ID du client (obligatoire si collectorId est absent)
 *               collectorId:
 *                 type: string
 *                 description: ID du collecteur (obligatoire si clientId est absent)
 *               agencyId:
 *                 type: string
 *                 description: ID de l'agence
 *               type:
 *                 type: string
 *                 description: Type de signalement
 *               description:
 *                 type: string
 *                 description: Description du problème
 *               severity:
 *                 type: string
 *                 description: Gravité du problème
 *                 enum: [low, medium, high]
 *               photos:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image associé au signalement
 *     responses:
 *       201:
 *         description: Signalement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Signalement créé avec succès ✅
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Erreur de validation (client ou collecteur requis, champs obligatoires manquants)
 *       404:
 *         description: Ressource introuvable (client, collecteur ou agence non trouvés)
 *       500:
 *         description: Erreur serveur
 */
router.post("/",upload.array('photos', 10), createReport);

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
router.post("/", upload.array('photos', 10), createReport);
router.get("/agency/:agencyId", getReportsByAgency);
router.get("/client/:clientId", getReportsByClient);
router.get("/collector/:collectorId", getReportsByCollector);
router.patch("/:reportId/status", updateReportStatus);


export default router;
