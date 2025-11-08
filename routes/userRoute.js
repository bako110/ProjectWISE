const express = require('express');
const router = express.Router();

const {  
  getUser,
  getAllUsers,
  updateUserById,
  deleteUserById,
  getClientByAgency,
  getUsersByAgency
} = require('../controllers/user.js');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs avec filtres, recherche et pagination
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         description: Recherche sur prénom, nom, email ou téléphone
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrer par rôle
 *       - in: query
 *         name: agencyId
 *         schema:
 *           type: string
 *         description: Filtrer par ID d'agence
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Filtrer par quartier
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: Erreur interne du serveur
 * 
 * 
 * /api/user/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Users]
 *     parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur rencontré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur interne du serveur
 * 
 * 
 *   put:
 *    summary: Mettre à jour un utilisateur par ID
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID de l'utilisateur
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: Utilisateur mis à jour avec succès
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      404:
 *        description: Utilisateur non rencontré
 *      500:
 *        description: Erreur interne du serveur
 * 
 *   delete:
 *    summary: Supprimer un utilisateur par ID
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID de l'utilisateur
 *    responses:
 *      200:
 *        description: Utilisateur supprimé avec succès
 *      404:
 *        description: Utilisateur non rencontré
 *      500:
 *        description: Erreur interne du serveur
 */

// Routes de gestion des utilisateurs
router.get('/user/:id', getUser);
router.get('/users', getAllUsers);
router.put('/user/:id', updateUserById);
router.delete('/user/:id', deleteUserById);
router.get('/clients/:agencyId', getClientByAgency);
router.get('/employees/:agencyId', getUsersByAgency);

module.exports = router;
