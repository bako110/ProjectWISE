const express = require('express');
const router = express.Router();



const {  register,
  login,
  getUser,
  getAllUsers,
  updateUserById,
  deleteUserById } = require('../controllers/auth.js');

// const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Routes pour l'authentification et la gestion des utilisateurs
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/User'
 *               - type: object
 *                 properties:
 *                   agency:
 *                     $ref: '#/components/schemas/Agence'
 *     responses:
 *       201:
 *         description: Utilisateur enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de validation ou données manquantes
 */

router.post('/register', register);
router.post('/login', login);
router.get('/user/:id', getUser);
router.get('/users', getAllUsers);
router.put('/user/:id', updateUserById);
router.delete('/user/:id', deleteUserById);

module.exports = router;