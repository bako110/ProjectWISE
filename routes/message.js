const { sendMessage, getMessages, getGroupeName, markMessagesAsRead, deleteMessage } = require('../controllers/message.js');


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
 */
router.post('/send', sendMessage);

router.get('/:userId/:receiverId', getMessages);

router.get('/groups/:userId', getGroupeName);
router.put('/markAsRead/:userId/:receiverId', markMessagesAsRead);
router.delete('/:messageId', deleteMessage);

module.exports = router;