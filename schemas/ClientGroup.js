/**
 * @swagger
 * components:
 *   schemas:
 *     ClientGroup:
 *       type: object
 *       required:
 *         - name
 *         - agencyId
 *         - clients
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: ID unique du groupe de clients
 *           example: 65f1b2c3d4e5f6a7b8c9d0f2
 *         name:
 *           type: string
 *           description: Nom du groupe
 *           example: "Groupe 1 - Ouaga 2000"
 *         agencyId:
 *           type: string
 *           format: objectId
 *           description: Référence vers l'agence
 *           example: 65f1b2c3d4e5f6a7b8c9d0e1
 *         clients:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: Liste des IDs des clients du groupe
 *           example: ["65f1b2c3d4e5f6a7b8c9d0e6", "65f1b2c3d4e5f6a7b8c9d0e7"]
 *         zone:
 *           type: string
 *           description: Zone géographique du groupe
 *           example: "Ouaga 2000"
 *         teamId:
 *           type: string
 *           format: objectId
 *           description: Référence vers l'équipe assignée
 *           example: 65f1b2c3d4e5f6a7b8c9d0f1
 *         estimatedCollectionTime:
 *           type: integer
 *           default: 0
 *           description: Temps estimé de collecte en minutes
 *           example: 120
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           description: Statut du groupe
 *           example: active
 *         description:
 *           type: string
 *           description: Description du groupe
 *           example: "Groupe de clients du secteur 15"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière modification
 */

/**
 * @swagger
 * tags:
 *   name: ClientGroups
 *   description: Gestion des groupes de clients
 */

/**
 * @swagger
 * /api/client-groups:
 *   post:
 *     summary: Créer un nouveau groupe de clients
 *     tags: [ClientGroups]
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
 *               - clients
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Groupe 1 - Ouaga 2000"
 *               agencyId:
 *                 type: string
 *                 example: "65f1b2c3d4e5f6a7b8c9d0e1"
 *               clients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65f1b2c3d4e5f6a7b8c9d0e6", "65f1b2c3d4e5f6a7b8c9d0e7"]
 *               zone:
 *                 type: string
 *                 example: "Ouaga 2000"
 *               teamId:
 *                 type: string
 *                 example: "65f1b2c3d4e5f6a7b8c9d0f1"
 *               description:
 *                 type: string
 *                 example: "Groupe de clients du secteur 15"
 *     responses:
 *       201:
 *         description: Groupe créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Groupe de clients créé avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/ClientGroup'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/client-groups/from-zone:
 *   post:
 *     summary: Créer un groupe automatiquement depuis une zone
 *     tags: [ClientGroups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agencyId
 *               - zone
 *             properties:
 *               agencyId:
 *                 type: string
 *                 example: "65f1b2c3d4e5f6a7b8c9d0e1"
 *               zone:
 *                 type: string
 *                 example: "Ouaga 2000"
 *               groupName:
 *                 type: string
 *                 example: "Groupe Auto - Ouaga 2000"
 *               teamId:
 *                 type: string
 *                 example: "65f1b2c3d4e5f6a7b8c9d0f1"
 *     responses:
 *       201:
 *         description: Groupe créé automatiquement
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/client-groups/agency/{agencyId}:
 *   get:
 *     summary: Obtenir tous les groupes d'une agence
 *     tags: [ClientGroups]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des groupes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClientGroup'
 */

/**
 * @swagger
 * /api/client-groups/agency/{agencyId}/available-clients:
 *   get:
 *     summary: Obtenir les clients disponibles d'une agence (non assignés à un groupe)
 *     tags: [ClientGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'agence
 *     responses:
 *       200:
 *         description: Liste des clients disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 45
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
 *                       address:
 *                         type: object
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/client-groups/team/{teamId}:
 *   get:
 *     summary: Obtenir tous les groupes d'une équipe
 *     tags: [ClientGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'équipe
 *     responses:
 *       200:
 *         description: Liste des groupes de l'équipe
 */

/**
 * @swagger
 * /api/client-groups/{groupId}:
 *   get:
 *     summary: Obtenir les détails d'un groupe
 *     tags: [ClientGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du groupe
 *       404:
 *         description: Groupe non trouvé
 *   put:
 *     summary: Mettre à jour un groupe
 *     tags: [ClientGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               clients:
 *                 type: array
 *                 items:
 *                   type: string
 *               zone:
 *                 type: string
 *               teamId:
 *                 type: string
 *               status:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Groupe mis à jour
 *   delete:
 *     summary: Supprimer un groupe
 *     tags: [ClientGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Groupe supprimé
 */

/**
 * @swagger
 * /api/client-groups/{groupId}/assign-team:
 *   post:
 *     summary: Assigner un groupe à une équipe
 *     tags: [ClientGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
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
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *                 example: "65f1b2c3d4e5f6a7b8c9d0f1"
 *     responses:
 *       200:
 *         description: Groupe assigné à l'équipe
 */

/**
 * @swagger
 * /api/client-groups/{groupId}/unassign-team:
 *   post:
 *     summary: Retirer un groupe d'une équipe
 *     tags: [ClientGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Groupe retiré de l'équipe
 */

/**
 * @swagger
 * /api/client-groups/{groupId}/add-clients:
 *   post:
 *     summary: Ajouter des clients à un groupe
 *     tags: [ClientGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
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
 *               - clientIds
 *             properties:
 *               clientIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65f1b2c3d4e5f6a7b8c9d0ea", "65f1b2c3d4e5f6a7b8c9d0eb"]
 *     responses:
 *       200:
 *         description: Clients ajoutés au groupe
 */

/**
 * @swagger
 * /api/client-groups/{groupId}/remove-clients:
 *   post:
 *     summary: Retirer des clients d'un groupe
 *     tags: [ClientGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
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
 *               - clientIds
 *             properties:
 *               clientIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65f1b2c3d4e5f6a7b8c9d0ea"]
 *     responses:
 *       200:
 *         description: Clients retirés du groupe
 */
