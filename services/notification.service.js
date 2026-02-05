const Notification = require('../models/Notification');

exports.notificationService = {
    async createNotification(data) {
        const notification = new Notification(data);
        return await notification.save();
    },

    async getUserNotifications(userId) {
        return await Notification.find({ user: userId });
    },

    async getUnreadNotifications(userId) {
        return await Notification.find({ user: userId, read: false });
    },

    async getNotificationById(notificationId) {
        return await Notification.findById(notificationId);
    },

    async markNotificationAsRead(notificationId) {
        return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
    },

    async deleteNotification(notificationId) {
        return await Notification.findByIdAndDelete(notificationId);
    }
};

// exports.notificationCreateByRole = {
//     async createNotificationSubscribed(data) {
//         data.type = 'Subscribed';
//         data.message = 'Vous êtes abonné avec succès.';
//         return await Notification.create(data);
//     },
// };
