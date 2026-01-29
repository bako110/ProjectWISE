const  {notificationController} = require('../controllers/notification.controller.js');
const authMiddleware = require('../middlewares/auth.js');

const express = require('express');
const router = express.Router(); 


/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: API pour gérer les notifications
 */


/**
 * @swagger
 * /api/notifications/create:
 *  post:
 *    summary: Créer une notification
 *    tags: [Notification]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Notification'
 *    responses:
 *      201:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Notification'
 *      500:
 *        description: Erreur serveur
 */
router.post('/create', authMiddleware(), notificationController.createNotification);

/** * @swagger
 * /api/notifications/get/{id}:
 *  get:
 *    summary: Récupérer une notification par ID utilisateur
 *    tags: [Notification]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID de l'utilisateur
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Notification'
 *      404:
 *        description: Notification non trouvée
 *      500:
 *        description: Erreur serveur
 */
router.get('/get/:id', notificationController.getNotifications);

/** * @swagger
 * /api/notifications/update/{id}:
 *  put:
 *    summary: Mettre à jour une notification par ID
 *    tags: [Notification]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID de la notification
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: boolean
 *                  example: true
 *                message:
 *                  type: string
 *                  example: notification mise à jour avec succès
 *      404:    
 *        description: Notification non trouvée
 *      500:
 *        description: Erreur serveur
 */
router.put('/update/:id', notificationController.markNotificationAsRead);

/** 
 * @swagger
 * /api/notifications/delete/{id}:
 *  delete:
 *    summary: Supprimer une notification par ID
 *    tags: [Notification]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID de la notification
 *    responses:
 *      200:
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: notification supprimé avec succès
 *      404:    
 *        description: Notification non trouvée
 *      500:
 *        description: Erreur serveur
 */
router.delete('/delete/:id', notificationController.deleteNotification);

module.exports = router;