const {
  createPlanning,
  getPlanningsByAgency,
  getPlanningById,
  updatePlanning,
  deletePlanning,
  getAllPlannings,
  getPlanningsByCollector,
  getMyClientsForPlanning, // <-- ajouté
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
 *     summary: Récupérer les plannings d'un collecteur spécifique avec résumés des groupes
 *     tags: [Planning]
 *     description: Retourne la liste des plannings avec un résumé du nombre de clients par planning (sans charger la liste complète)
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du collecteur
 *     responses:
 *       200:
 *         description: Liste des plannings du collecteur avec résumés des groupes de clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plannings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       zone:
 *                         type: string
 *                       date:
 *                         type: string
 *                       startTime:
 *                         type: string
 *                       endTime:
 *                         type: string
 *                       teamId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       clientGroupId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           zone:
 *                             type: string
 *                       myClientsCount:
 *                         type: integer
 *                         description: Nombre de clients assignés spécifiquement à ce collecteur
 *                       clientGroupDetails:
 *                         type: object
 *                         properties:
 *                           totalClients:
 *                             type: integer
 *                             description: Nombre total de clients dans le groupe
 *                 collectes:
 *                   type: integer
 *                   description: Nombre total de collectes
 *                 totalClients:
 *                   type: integer
 *                   description: Nombre total de clients sur tous les plannings
 *       400:
 *         description: Paramètre collectorId manquant
 *       500:
 *         description: Erreur serveur
 *
 * /api/planning/collector/{collectorId}/planning/{planningId}/clients:
 *   get:
 *     summary: Récupérer la liste détaillée des clients d'un collecteur pour un planning spécifique
 *     tags: [Planning]
 *     description: Permet au collecteur de voir la liste complète de ses clients assignés pour un planning donné
 *     parameters:
 *       - in: path
 *         name: collectorId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du collecteur
 *       - in: path
 *         name: planningId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du planning
 *     responses:
 *       200:
 *         description: Liste détaillée des clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 planning:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     zone:
 *                       type: string
 *                     date:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *                     team:
 *                       type: object
 *                       description: Informations de l'équipe (si applicable)
 *                     clientGroup:
 *                       type: object
 *                       description: Informations du groupe de clients (si applicable)
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       collecteId:
 *                         type: string
 *                         description: ID de la collecte
 *                       client:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           address:
 *                             type: string
 *                           email:
 *                             type: string
 *                       nbCollecte:
 *                         type: integer
 *                         description: Numéro de la collecte
 *                       type:
 *                         type: string
 *                         description: Type de collecte
 *                       status:
 *                         type: string
 *                         description: Statut de la collecte
 *                 totalClients:
 *                   type: integer
 *                   description: Nombre total de clients dans cette liste
 *       400:
 *         description: Paramètres manquants
 *       404:
 *         description: Planning non trouvé ou collecteur non assigné
 *       500:
 *         description: Erreur serveur
 */

router.post('/create', authMiddleware('manager'), createPlanning);
router.get('/get/:id', authMiddleware(), getPlanningById);
router.put('/update/:id', authMiddleware('manager'), updatePlanning);
router.delete('/delete/:id', authMiddleware('manager'), deletePlanning);
router.get('/getAll', authMiddleware(), getAllPlannings);
router.get('/agency/:agencyId', authMiddleware(), getPlanningsByAgency);
router.get('/collector/:collectorId', authMiddleware(), getPlanningsByCollector);
router.get('/collector/:collectorId/planning/:planningId/clients', authMiddleware(), getMyClientsForPlanning); // ✅ Liste détaillée des clients

module.exports = router;
