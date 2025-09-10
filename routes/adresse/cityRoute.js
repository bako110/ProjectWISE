import express from "express";
import { createCity, updateCity, removeCity, getCityById, listCity } from "../../controllers/adresse/cityController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cities
 *   description: Gestion des villes
 */

/**
 * @swagger
 * /cities:
 *   post:
 *     summary: Créer une nouvelle ville
 *     tags: [Cities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - arrondissements
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de la ville
 *               arrondissements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des arrondissements
 *     responses:
 *       201:
 *         description: Ville créée avec succès
 *       400:
 *         description: Nom ou arrondissements manquants ou déjà existant
 *       500:
 *         description: Erreur serveur
 */
router.post('/cities', createCity);

/**
 * @swagger
 * /cities/{id}:
 *   put:
 *     summary: Modifier une ville existante
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ville
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nouveau nom de la ville
 *               arrondissements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Nouvelle liste des IDs des arrondissements
 *     responses:
 *       200:
 *         description: Ville modifiée avec succès
 *       400:
 *         description: Ville déjà existante
 *       404:
 *         description: Ville non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/cities/:id', updateCity);

/**
 * @swagger
 * /cities/{id}:
 *   delete:
 *     summary: Supprimer une ville
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ville
 *     responses:
 *       200:
 *         description: Ville supprimée avec succès
 *       404:
 *         description: Ville non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/cities/:id', removeCity);

/**
 * @swagger
 * /cities/{id}:
 *   get:
 *     summary: Obtenir une ville par ID
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ville
 *     responses:
 *       200:
 *         description: Ville trouvée
 *       404:
 *         description: Ville non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/cities/:id', getCityById);

/**
 * @swagger
 * /cities:
 *   get:
 *     summary: Lister toutes les villes (avec pagination)
 *     tags: [Cities]
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
 *         description: Liste des villes
 *       500:
 *         description: Erreur serveur
 */
router.get('/cities', listCity);

export default router;
