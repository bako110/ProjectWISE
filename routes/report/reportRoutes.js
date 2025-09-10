import express from "express";
import {
  createReport,
  getReportsByAgency,
  getReportsByClient,
  getReportsByCollector,
  updateReportStatus,
  getAllReports
} from "../../controllers/report/reportController.js";

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
router.post("/", createReport);

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
router.patch("/:reportId/status", updateReportStatus);

export default router;
