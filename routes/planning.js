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
 *     summary: Créer un planning (simple ou récurrent avec duplication automatique)
 *     tags: [Planning]
 *     description: |
 *       Crée un nouveau planning pour une zone et une date spécifiques.
 *       
 *       **Planning simple** : Créé une seule fois pour la date indiquée.
 *       
 *       **Planning récurrent** : Active la duplication automatique.
 *       - Le système dupliquera automatiquement le planning chaque semaine (ou selon recurrenceType)
 *       - La duplication se fait via un cron job
 *       - Le planning sera dupliqué pendant le nombre de semaines spécifié (numberOfWeeks)
 *       - L'admin n'a plus besoin de recréer manuellement les plannings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - managerId
 *               - agencyId
 *               - pricingId
 *               - zone
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               managerId:
 *                 type: string
 *                 format: objectId
 *                 description: ID du gestionnaire
 *               agencyId:
 *                 type: string
 *                 format: objectId
 *                 description: ID de l'agence
 *               collectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *                 description: Tableau des IDs des collecteurs assignés (nouveau format, recommandé)
 *               collectorId:
 *                 type: string
 *                 format: objectId
 *                 description: ID du collecteur assigné (ancien format, toujours supporté pour rétrocompatibilité)
 *               pricingId:
 *                 type: string
 *                 format: objectId
 *                 description: ID du tarif (pricing) appliqué au planning
 *               zone:
 *                 type: string
 *                 description: Zone/quartier de collecte
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date de la première collecte
 *               startTime:
 *                 type: string
 *                 description: Heure de début (format HH:mm)
 *               endTime:
 *                 type: string
 *                 description: Heure de fin (format HH:mm)
 *               isRecurring:
 *                 type: boolean
 *                 description: "Active la duplication automatique du planning (optionnel, défaut: false)"
 *               recurrenceType:
 *                 type: string
 *                 enum: [weekly, biweekly, monthly]
 *                 description: "Type de récurrence - weekly (hebdomadaire), biweekly (bi-hebdomadaire), monthly (mensuel)"
 *               numberOfWeeks:
 *                 type: integer
 *                 description: "Nombre de semaines pour la récurrence (optionnel, défaut: 1)"
 *             example:
 *               managerId: "64f1b82a5e3d9c2b68d94b71"
 *               agencyId: "64f1b82a5e3d9c2b68d94b73"
 *               collectors: ["64f1b82a5e3d9c2b68d94b72", "64f1b82a5e3d9c2b68d94b75"]
 *               pricingId: "64f1b82a5e3d9c2b68d94b80"
 *               zone: "Ouaga 2000"
 *               date: "2026-03-10"
 *               startTime: "08:00"
 *               endTime: "12:00"
 *               isRecurring: true
 *               recurrenceType: "weekly"
 *               numberOfWeeks: 4
 *     responses:
 *       201:
 *         description: Planning créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Planning'
 *       400:
 *         description: Champs requis manquants
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
