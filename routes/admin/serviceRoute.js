import express from 'express';
import { createService, updateService, getAllServices, getServiceById, deleteService } from '../../controllers/admin/serviceController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();


router.post('/create', authMiddleware('super_admin'), createService);
router.put('/:id', authMiddleware('super_admin'), updateService);
router.get('/all', getAllServices);
router.get('/:id', getServiceById);
router.delete('/:id', authMiddleware('super_admin'), deleteService);
/**
 * @swagger
 * /api/services/create:
 *   post:
 *     summary: Créer un nouveau service
 *     tags:
 *       - Admin Services
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
 *               - description
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Assistance Client
 *               description:
 *                 type: string
 *                 example: Service d'assistance 24/7
 *               type:
 *                 type: string
 *                 example: Support
 *     responses:
 *       201:
 *         description: Service créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Le service a été bien créée avec succès
 *                 service:
 *                   $ref: '#/components/schemas/Service'
 *       400:
 *         description: Champs obligatoires manquants
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Mettre à jour un service existant
 *     tags:
 *       - Admin Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f3abc1234ef23456789abc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nouveau nom
 *               description:
 *                 type: string
 *                 example: Nouvelle description
 *               type:
 *                 type: string
 *                 example: Type mis à jour
 *     responses:
 *       200:
 *         description: Service mis à jour avec succès
 *       400:
 *         description: Champs obligatoires manquants
 *       404:
 *         description: Service non trouvée
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/services/all:
 *   get:
 *     summary: Obtenir tous les services
 *     tags:
 *       - Admin Services
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Obtenir un service par ID
 *     tags:
 *       - Admin Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f3abc1234ef23456789abc
 *     responses:
 *       200:
 *         description: Détails du service
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service non trouvée
 *       500:
 *         description: Erreur serveur
 */

/**
* @swagger
* /api/services/{id}:
*   delete:
*      summary: Supprimer un service par ID
*      tags:
*        - Admin Services
*      security:
*        - bearerAuth: []
*      parameters:
*        - in: path
*          name: id
*          required: true
*          schema:
*              type: string
*              example: 64f3abc1234ef23456789abc
*      responses:
*          200:
*              description: Service supprimée avec succès
*          404:
*              description: Service non trouvée
*          500:
*              description: Erreur serveur
*/

export default router;