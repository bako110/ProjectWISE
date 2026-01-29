const {
  createPlanning,
  getPlanningsByAgency,
  getPlanningById,
  updatePlanning,
  deletePlanning,
  getAllPlannings,
  getPlanningsByCollector, // <-- ajouté
} = require('../controllers/planning');
const authMiddleware = require('../middlewares/auth.js');

const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Planning
 *   description: API pour gérer les plannings
 */

/**
 * @swagger
 * /api/planning/create:
 *   post:
 *     summary: Créer un planning
 *     tags: [Planning]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Planning'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Planning'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/planning/get/{id}:
 *   get:
 *     summary: Récupérer un planning par ID
 *     tags: [Planning]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du planning
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Planning'
 *       404:
 *         description: Planning non trouvé
 *       500:
 *         description: Erreur serveur
 * 
 * /api/planning/update/{id}:
 *   put:
 *     summary: Mettre à jour un planning par ID
 *     tags: [Planning]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du planning
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Planning'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Planning'
 *       404:
 *         description: Planning non rencontré
 *       500:
 *         description: Erreur serveur
 * 
 * /api/planning/delete/{id}:
 *   delete:
 *     summary: Supprimer un planning par ID
 *     tags: [Planning]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du planning
 *     responses:
 *       200:
 *         description: Planning supprimé avec succès
 *       404:
 *         description: Planning non rencontré
 *       500:
 *         description: Erreur serveur
 * 
 * /api/planning/getAll:
 *   get:
 *     summary: Récupérer tous les plannings
 *     tags: [Planning]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Planning'
 *       500:
 *         description: Erreur serveur
 * 
 * /api/planning/agency/{agencyId}:
 *   get:
 *     summary: Récupérer les plannings par agence
 *     tags: [Planning]
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'agence
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Planning'
 *       500:
 *         description: Erreur serveur
 *
 * /api/planning/collector/{collectorId}:
 *   get:
 *     summary: Récupérer les plannings d’un collecteur spécifique
 *     tags: [Planning]
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du collecteur
 *     responses:
 *       200:
 *         description: Liste des plannings du collecteur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Planning'
 *       400:
 *         description: Paramètre collectorId manquant
 *       500:
 *         description: Erreur serveur
 */

router.post('/create', authMiddleware('manager'), createPlanning);
router.get('/get/:id', authMiddleware(), getPlanningById);
router.put('/update/:id', authMiddleware('manager'), updatePlanning);
router.delete('/delete/:id', authMiddleware('manager'), deletePlanning);
router.get('/getAll', authMiddleware(), getAllPlannings);
router.get('/agency/:agencyId', authMiddleware(), getPlanningsByAgency);
router.get('/collector/:collectorId', authMiddleware(), getPlanningsByCollector); // ✅ Nouvelle route

module.exports = router;
