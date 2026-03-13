/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       required:
 *         - name
 *         - agencyId
 *         - leaderId
 *         - collectors
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: ID unique de l'équipe
 *           example: 65f1b2c3d4e5f6a7b8c9d0f1
 *         name:
 *           type: string
 *           description: Nom de l'équipe
 *           example: "Équipe A - Ouaga Centre"
 *         agencyId:
 *           type: string
 *           format: objectId
 *           description: Référence vers l'agence
 *           example: 65f1b2c3d4e5f6a7b8c9d0e1
 *         leaderId:
 *           type: string
 *           format: objectId
 *           description: Référence vers le responsable de l'équipe
 *           example: 65f1b2c3d4e5f6a7b8c9d0e2
 *         collectors:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: Liste des IDs des collecteurs membres de l'équipe
 *           example: ["65f1b2c3d4e5f6a7b8c9d0e3", "65f1b2c3d4e5f6a7b8c9d0e4"]
 *         zones:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des zones couvertes par l'équipe
 *           example: ["Ouaga 2000", "Kalgondin"]
 *         maxClientsPerDay:
 *           type: integer
 *           default: 50
 *           description: Nombre maximum de clients par jour
 *           example: 60
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           description: Statut de l'équipe
 *           example: active
 *         description:
 *           type: string
 *           description: Description de l'équipe
 *           example: "Équipe principale pour le centre ville"
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
 *   name: Teams
 *   description: Gestion des équipes de collecteurs
 */

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Créer une nouvelle équipe de collecteurs
 *     tags: [Teams]
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
 *               - leaderId
 *               - collectors
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Équipe A - Ouaga Centre"
 *               agencyId:
 *                 type: string
 *                 example: "65f1b2c3d4e5f6a7b8c9d0e1"
 *               leaderId:
 *                 type: string
 *                 example: "65f1b2c3d4e5f6a7b8c9d0e2"
 *               collectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65f1b2c3d4e5f6a7b8c9d0e3", "65f1b2c3d4e5f6a7b8c9d0e4"]
 *               zones:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Ouaga 2000", "Kalgondin"]
 *               maxClientsPerDay:
 *                 type: integer
 *                 example: 60
 *               description:
 *                 type: string
 *                 example: "Équipe principale pour le centre ville"
 *     responses:
 *       201:
 *         description: Équipe créée avec succès
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
 *                   example: "Équipe créée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/teams/agency/{agencyId}:
 *   get:
 *     summary: Obtenir toutes les équipes d'une agence
 *     tags: [Teams]
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
 *         description: Liste des équipes récupérée avec succès
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
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 */

/**
 * @swagger
 * /api/teams/{teamId}:
 *   get:
 *     summary: Obtenir les détails d'une équipe
 *     tags: [Teams]
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
 *         description: Détails de l'équipe
 *       404:
 *         description: Équipe non trouvée
 *   put:
 *     summary: Mettre à jour une équipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
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
 *               leaderId:
 *                 type: string
 *               collectors:
 *                 type: array
 *                 items:
 *                   type: string
 *               zones:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxClientsPerDay:
 *                 type: integer
 *               status:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Équipe mise à jour avec succès
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     summary: Supprimer une équipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Équipe supprimée avec succès
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/teams/{teamId}/stats:
 *   get:
 *     summary: Obtenir les statistiques d'une équipe
 *     tags: [Teams]
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
 *         description: Statistiques de l'équipe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     teamId:
 *                       type: string
 *                     teamName:
 *                       type: string
 *                     collectorsCount:
 *                       type: integer
 *                     clientGroups:
 *                       type: integer
 *                     totalClients:
 *                       type: integer
 *                     activePlannings:
 *                       type: integer
 *                     collectesThisMonth:
 *                       type: integer
 */
