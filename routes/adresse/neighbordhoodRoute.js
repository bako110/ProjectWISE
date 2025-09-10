import { createNeighborhood, updateNeighborhood, removeNeighborhood, getNeighborhoodById, listNeighborhood } from "../../controllers/adresse/neighbordhoodController.js";
import express from "express";

const router = express.Router();

/**
 * @swagger
 * /neighborhoods:
 *   post:
 *     summary: Créer un nouveau quartier
 *     tags: [Neighborhoods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du quartier
 *     responses:
 *       201:
 *         description: Quartier créé avec succès
 *       400:
 *         description: Nom du quartier manquant ou déjà existant
 *       500:
 *         description: Erreur serveur
 */
router.post('/neighborhoods', createNeighborhood);

/**
 * @swagger
 * /neighborhoods/{id}:
 *   put:
 *     summary: Modifier un quartier existant
 *     tags: [Neighborhoods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du quartier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nouveau nom du quartier
 *     responses:
 *       200:
 *         description: Quartier modifié avec succès
 *       400:
 *         description: Nom du quartier manquant ou déjà existant
 *       404:
 *         description: Quartier non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/neighborhoods/:id', updateNeighborhood);

/**
 * @swagger
 * /neighborhoods/{id}:
 *   delete:
 *     summary: Supprimer un quartier
 *     tags: [Neighborhoods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du quartier
 *     responses:
 *       200:
 *         description: Quartier supprimé avec succès
 *       404:
 *         description: Quartier non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/neighborhoods/:id', removeNeighborhood);

/**
 * @swagger
 * /neighborhoods/{id}:
 *   get:
 *     summary: Obtenir un quartier par ID
 *     tags: [Neighborhoods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du quartier
 *     responses:
 *       200:
 *         description: Quartier trouvé
 *       404:
 *         description: Quartier non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/neighborhoods/:id', getNeighborhoodById);

/**
 * @swagger
 * /neighborhoods:
 *   get:
 *     summary: Lister tous les quartiers (avec pagination)
 *     tags: [Neighborhoods]
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
 *         description: Liste des quartiers
 *       500:
 *         description: Erreur serveur
 */
router.get('/neighborhoods', listNeighborhood);

export default router;
