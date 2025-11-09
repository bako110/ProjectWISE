const  {createNotification, getUserNotifications, markNotificationAsRead, deleteNotification} = require('../controllers/notification');

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
router.post('/create', createNotification);

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
router.get('/get/:id', getUserNotifications);

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
 *              $ref: '#/components/schemas/Notification'
 *      404:    
 *        description: Notification non trouvée
 *      500:
 *        description: Erreur serveur
 */
router.put('/update/:id', markNotificationAsRead);

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
 *            schema:
 *              $ref: '#/components/schemas/Notification'
 *      404:    
 *        description: Notification non trouvée
 *      500:
 *        description: Erreur serveur
 */
router.delete('/delete/:id', deleteNotification);

module.exports = router;