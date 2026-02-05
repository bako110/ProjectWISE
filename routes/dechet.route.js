const DechetController = require('../controllers/dechet.controller.js');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.js');

/**
 * @swagger
 * tags:
 *   name: Dechet
 *   description: API pour gérer les déchets
*/



// Créer un nouveau déchet
/**
 * @swagger
 * /api/dechets/create:
 *   post:
 *     summary: Créer un nouveau déchet
 *     tags: [Dechet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Dechet'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dechet'
 */
router.post('/create', authMiddleware(), DechetController.createDechet);

// Récupérer un déchet par ID
/**
 * @swagger
 * /api/dechets/{id}:
 *   get:
 *     summary: Récupérer un déchet par ID
 *     tags: [Dechet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du déchet
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dechet'
 */
router.get('/:id', authMiddleware(), DechetController.getDechetById);

// Récupérer tous les déchets
/**
 * @swagger
 * /api/dechets:
 *   get:
 *     summary: Récupérer tous les déchets
 *     tags: [Dechet]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dechet'
 */
router.get('/', DechetController.getAllDechets);

// Mettre à jour un déchet
/**
 * @swagger
 * /api/dechets/update/{id}:
 *   put:
 *     summary: Mettre à jour un déchet
 *     tags: [Dechet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du déchet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Dechet'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dechet'
 */
router.put('/update/:id', authMiddleware(), DechetController.updateDechet);

// Supprimer un déchet
/**
 * @swagger
 * /api/dechets/delete/{id}:
 *   delete:
 *     summary: Supprimer un déchet
 *     tags: [Dechet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du déchet
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dechet'
 */
router.delete('/delete/:id', authMiddleware(), DechetController.deleteDechet);

module.exports = router;