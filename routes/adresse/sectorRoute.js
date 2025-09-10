import express from "express";
import { createSector, updateSector, removeSector, getSectorById, getSectors } from "../../controllers/adresse/sectorController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sectors
 *   description: Gestion des secteurs
 */

/**
 * @swagger
 * /sectors:
 *   post:
 *     summary: Créer un nouveau secteur
 *     tags: [Sectors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - neighborhoods
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du secteur
 *               neighborhoods:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des quartiers
 *     responses:
 *       201:
 *         description: Secteur créé avec succès
 *       400:
 *         description: Informations manquantes ou secteur déjà existant
 *       500:
 *         description: Erreur serveur
 */
router.post('/sectors', createSector);

/**
 * @swagger
 * /sectors/{id}:
 *   put:
 *     summary: Modifier un secteur existant
 *     tags: [Sectors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du secteur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nouveau nom du secteur
 *               neighborhoods:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Nouvelle liste des IDs des quartiers
 *     responses:
 *       200:
 *         description: Secteur modifié avec succès
 *       400:
 *         description: Secteur déjà existant
 *       404:
 *         description: Secteur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/sectors/:id', updateSector);

/**
 * @swagger
 * /sectors/{id}:
 *   delete:
 *     summary: Supprimer un secteur
 *     tags: [Sectors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du secteur
 *     responses:
 *       200:
 *         description: Secteur supprimé
 *       404:
 *         description: Secteur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/sectors/:id', removeSector);

/**
 * @swagger
 * /sectors/{id}:
 *   get:
 *     summary: Obtenir un secteur par ID
 *     tags: [Sectors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du secteur
 *     responses:
 *       200:
 *         description: Secteur trouvé
 *       404:
 *         description: Secteur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/sectors/:id', getSectorById);

/**
 * @swagger
 * /sectors:
 *   get:
 *     summary: Lister tous les secteurs (avec pagination)
 *     tags: [Sectors]
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
 *         description: Liste des secteurs
 *       500:
 *         description: Erreur serveur
 */
router.get('/sectors', getSectors);

export default router;