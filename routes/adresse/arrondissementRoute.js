import express from "express";
import { createArrondissement, updateArrondissement, removeArrondissement, getArrondissementById, listArrondissement } from "../../controllers/adresse/arrondissementController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Arrondissements
 *   description: Gestion des arrondissements
 */

/**
 * @swagger
 * /arrondissements:
 *   post:
 *     summary: Créer un nouvel arrondissement
 *     tags: [Arrondissements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sectors
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'arrondissement
 *               sectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des secteurs
 *     responses:
 *       201:
 *         description: Arrondissement créé avec succès
 *       400:
 *         description: Nom ou secteurs manquants ou déjà existant
 *       500:
 *         description: Erreur serveur
 */
router.post('/arrondissements', createArrondissement);

/**
 * @swagger
 * /arrondissements/{id}:
 *   put:
 *     summary: Modifier un arrondissement existant
 *     tags: [Arrondissements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'arrondissement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nouveau nom de l'arrondissement
 *               sectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Nouvelle liste des IDs des secteurs
 *     responses:
 *       200:
 *         description: Arrondissement modifié avec succès
 *       400:
 *         description: Arrondissement déjà existant
 *       404:
 *         description: Arrondissement non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/arrondissements/:id', updateArrondissement);

/**
 * @swagger
 * /arrondissements/{id}:
 *   delete:
 *     summary: Supprimer un arrondissement
 *     tags: [Arrondissements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'arrondissement
 *     responses:
 *       200:
 *         description: Arrondissement supprimé avec succès
 *       404:
 *         description: Arrondissement non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/arrondissements/:id', removeArrondissement);

/**
 * @swagger
 * /arrondissements/{id}:
 *   get:
 *     summary: Obtenir un arrondissement par ID
 *     tags: [Arrondissements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'arrondissement
 *     responses:
 *       200:
 *         description: Arrondissement trouvé
 *       404:
 *         description: Arrondissement non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/arrondissements/:id', getArrondissementById);

/**
 * @swagger
 * /arrondissements:
 *   get:
 *     summary: Lister tous les arrondissements (avec pagination)
 *     tags: [Arrondissements]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des arrondissements
 *       500:
 *         description: Erreur serveur
 */
router.get('/arrondissements', listArrondissement);

export default router;
