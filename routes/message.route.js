const { messageController } = require('../controllers/message.controller.js');


const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: API pour gérer les messages
 */

/**
 * @swagger
 * /api/messages/send:
 *  post:
 *    summary: Envoyer un message
 *    tags: [Message]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Message'
 *    responses:
 *      201:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Message'
 *      500:
 *        description: Erreur serveur
 * 
 * /api/messages/{userId}/{receiverId}:
 *  get:
 *    summary: Récupérer tous les messages entre deux utilisateurs
 *    tags: [Message]
 *    parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        schema:
 *          type: string
 *        description: ID de l'utilisateur
 *      - in: path
 *        name: receiverId
 *        required: true
 *        schema:
 *          type: string
 *        description: ID de l'utilisateur destinataire
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Message'
 *      500:
 *        description: Erreur serveur   
 * 
 * /api/messages/markAsRead/{messageId}:
 *  put:
 *    summary: Marquer un message comme lu
 *    tags: [Message]
 *    parameters:
 *      - in: path
 *        name: messageId
 *        required: true
 *        schema:
 *          type: string
 *        description: ID du message
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Message'
 *      500:
 *        description: Erreur serveur
 * 
 * /api/messages/{messageId}:
 *   delete:
 *     summary: Supprimer un message
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du message à supprimer
 *     responses:
 *       200:
 *         description: Message supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message supprimé avec succès
 *       500:
 *         description: Erreur serveur
 */

/**
 * @Swagger
 * api/messages/{userId}/all
 * get:
 *   summary: Récupérer tous les messages d'un utilisateur
 *   tags: [Message]
 *   parameters:
 *     - in: path
 *       name: userId
 *       required: true
 *       schema:
 *         type: string
 *       description: ID de l'utilisateur
 *   responses:
 *     200:
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Message'
 *    500:
 *      description: Erreur serveur
 * 
 * 
 * api/messages/groups/{userId}
 * get:
 *   summary: Obtenir les noms des groupes de discussion d'un utilisateur
 *   tags: [Message]
 *   parameters:
 *     - in: path
 *       name: userId
 *       required: true
 *       schema:
 *         type: string
 *       description: ID de l'utilisateur
 *   responses:
 *     200:
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/User'
 *     500:
 *       description: Erreur serveur
 */

router.get('/:userId/all', messageController.getUserMessages);
router.post('/send', messageController.sendMessage);

router.get('/:userId/:receiverId', messageController.getMessages);

router.get('/groups/:userId', messageController.getGroupeName);
router.put('/markAsRead/:messageId', messageController.markMessagesAsRead);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;