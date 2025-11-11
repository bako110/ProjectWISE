const  {notificationService} = require('../services/notification.service.js');

exports.notificationController = {
    async createNotification(req, res) {
        const { user, message, type } = req.body;
        try {
            if (!user || !message || !type) {
                return res.status(400).json({ message: 'Champs requis manquants' });
            }
            const notification = await notificationService.createNotification({ user, message, type });
            res.status(201).json(notification);
        } catch (error) {
            console.error('Error creating notification:', error);
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    },

    async getNotifications(req, res) {
        const { userId } = req.params;
        try {
            const notifications = await notificationService.getUserNotifications(userId);
            res.status(200).json(notifications);
        } catch (error) {
            console.error('Error retrieving notifications:', error);
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    },

    async markNotificationAsRead(req, res) {
        const { notificationId } = req.params;
        try {
            const notification = await notificationService.markNotificationAsRead(notificationId);
            if (!notification) {
                return res.status(404).json({ message: 'Notification non trouvée' });
            }
            res.status(200).json({ data:true,message: 'Notification marquée comme lu' });
        } catch (error) {
            console.error('Error updating notification:', error);
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    },

    async deleteNotification(req, res) {
        const { notificationId } = req.params;
        try {
            const notification = await notificationService.deleteNotification(notificationId);
            if (!notification) {
                return res.status(404).json({ message: 'Notification non trouvée' });
            }
            res.status(200).json({ data:true, message: 'Notification supprimée avec succès' });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    }

}




