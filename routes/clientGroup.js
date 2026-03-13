const express = require('express');
const router = express.Router();
const clientGroupController = require('../controllers/clientGroup');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /api/client-groups:
 *   post:
 *     summary: Créer un nouveau groupe de clients
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - agencyId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du groupe
 *                 example: "Clients Premium"
 *               description:
 *                 type: string
 *                 description: Description du groupe
 *                 example: "Groupe des clients avec abonnement premium"
 *               agencyId:
 *                 type: string
 *                 description: ID de l'agence
 *                 example: "60d21b4667d0d8992e610c85"
 *               clientIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs des clients à ajouter au groupe
 *                 example: ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"]
 *     responses:
 *       201:
 *         description: Groupe créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/', authMiddleware(), clientGroupController.createClientGroup);

/**
 * @swagger
 * /api/client-groups/from-zone:
 *   post:
 *     summary: Créer un groupe automatiquement depuis une zone
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - zoneId
 *               - name
 *               - agencyId
 *             properties:
 *               zoneId:
 *                 type: string
 *                 description: ID de la zone source
 *                 example: "60d21b4667d0d8992e610c90"
 *               name:
 *                 type: string
 *                 description: Nom du groupe
 *                 example: "Zone Nord - Clients"
 *               agencyId:
 *                 type: string
 *                 description: ID de l'agence
 *                 example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       201:
 *         description: Groupe créé avec succès depuis la zone
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Zone non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/from-zone', authMiddleware(), clientGroupController.createClientGroupFromZone);

/**
 * @swagger
 * /api/client-groups/agency/{agencyId}:
 *   get:
 *     summary: Obtenir tous les groupes d'une agence
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agence
 *         example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Liste des groupes récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Agence non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/agency/:agencyId', authMiddleware(), clientGroupController.getClientGroupsByAgency);

/**
 * @swagger
 * /api/client-groups/agency/{agencyId}/available-clients:
 *   get:
 *     summary: Obtenir les clients disponibles (non assignés à un groupe) d'une agence
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agence
 *         example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Liste des clients disponibles récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Agence non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/agency/:agencyId/available-clients', authMiddleware(), clientGroupController.getAvailableClientsByAgency);

/**
 * @swagger
 * /api/client-groups/team/{teamId}:
 *   get:
 *     summary: Obtenir tous les groupes d'une équipe
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'équipe
 *         example: "60d21b4667d0d8992e610c91"
 *     responses:
 *       200:
 *         description: Liste des groupes de l'équipe récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Équipe non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/team/:teamId', authMiddleware(), clientGroupController.getClientGroupsByTeam);

/**
 * @swagger
 * /api/client-groups/{groupId}:
 *   get:
 *     summary: Obtenir les détails d'un groupe
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du groupe
 *         example: "60d21b4667d0d8992e610c92"
 *     responses:
 *       200:
 *         description: Détails du groupe récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Groupe non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/:groupId', authMiddleware(), clientGroupController.getClientGroupById);

/**
 * @swagger
 * /api/client-groups/{groupId}:
 *   put:
 *     summary: Mettre à jour un groupe
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du groupe
 *         example: "60d21b4667d0d8992e610c92"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du groupe
 *                 example: "Clients Premium - Mis à jour"
 *               description:
 *                 type: string
 *                 description: Description du groupe
 *                 example: "Nouvelle description du groupe"
 *     responses:
 *       200:
 *         description: Groupe mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Groupe non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.put('/:groupId', authMiddleware(), clientGroupController.updateClientGroup);

/**
 * @swagger
 * /api/client-groups/{groupId}:
 *   delete:
 *     summary: Supprimer un groupe
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du groupe
 *         example: "60d21b4667d0d8992e610c92"
 *     responses:
 *       200:
 *         description: Groupe supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Groupe non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete('/:groupId', authMiddleware(), clientGroupController.deleteClientGroup);

/**
 * @swagger
 * /api/client-groups/{groupId}/team:
 *   put:
 *     summary: Assigner/remplacer l'équipe d'un groupe
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du groupe
 *         example: "60d21b4667d0d8992e610c92"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *                 description: ID de l'équipe à assigner
 *                 example: "60d21b4667d0d8992e610c91"
 *     responses:
 *       200:
 *         description: Équipe assignée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Groupe ou équipe non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.put('/:groupId/team', authMiddleware(), clientGroupController.assignGroupToTeam);

/**
 * @swagger
 * /api/client-groups/{groupId}/team:
 *   delete:
 *     summary: Retirer l'équipe d'un groupe
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du groupe
 *         example: "60d21b4667d0d8992e610c92"
 *     responses:
 *       200:
 *         description: Équipe retirée avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Groupe non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete('/:groupId/team', authMiddleware(), clientGroupController.unassignGroupFromTeam);

/**
 * @swagger
 * /api/client-groups/{groupId}/clients:
 *   post:
 *     summary: Ajouter des clients à un groupe
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du groupe
 *         example: "60d21b4667d0d8992e610c92"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientIds
 *             properties:
 *               clientIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs des clients à ajouter
 *                 example: ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"]
 *     responses:
 *       200:
 *         description: Clients ajoutés avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Groupe non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/:groupId/clients', authMiddleware(), clientGroupController.addClientsToGroup);

/**
 * @swagger
 * /api/client-groups/{groupId}/clients:
 *   delete:
 *     summary: Retirer des clients d'un groupe
 *     tags: [Client Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du groupe
 *         example: "60d21b4667d0d8992e610c92"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientIds
 *             properties:
 *               clientIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs des clients à retirer
 *                 example: ["60d21b4667d0d8992e610c86"]
 *     responses:
 *       200:
 *         description: Clients retirés avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Groupe non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete('/:groupId/clients', authMiddleware(), clientGroupController.removeClientsFromGroup);

module.exports = router;