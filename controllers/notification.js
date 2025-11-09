const  {createNotification, getUserNotifications, markNotificationAsRead, deleteNotification} = require('../services/notification.js');

// Créer une notification
exports.createNotification = async (req, res) => {
    await createNotification(req, res);
};

// Récupérer les notifications d'un utilisateur
exports.getUserNotifications = async (req, res) => {
    await getUserNotifications(req, res);
};
// Marquer une notification comme lue   
exports.markNotificationAsRead = async (req, res) => {
    await markNotificationAsRead(req, res);
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
    await deleteNotification(req, res);
};