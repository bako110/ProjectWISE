import Notification from '../models/Notification.js';

// Créer une notification
export const createNotification = async (req, res) => {
    const { user, message, type } = req.body;

    try {
        const notification = new Notification({ user, message, type });
        await notification.save();
        res.status(201).json({ message: 'Notification created successfully', notification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Récupérer les notifications d'un utilisateur
export const getUserNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        const notifications = await Notification.find({ user: userId });
        res.status(200).json({notifications});
    } catch (error) {
        console.error('Error retrieving notifications:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Marquer une notification comme lu
export const markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;
    try {
        const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Supprimer une notification
export const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
    try {
        const notification = await Notification.findByIdAndDelete(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};