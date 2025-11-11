const { messageService } = require('../services/message.service.js');


//exports des fonctions de controleur de message dans un seul objet
exports.messageController = {

    // le controller pour envoyer un message
    async sendMessage (req, res) {
        try {
            if (!req.body) {
                return res.status(400).json({ error: 'Données de message manquantes' });
            }
            const message = await messageService.sendMessage(req.body);
            return res.status(201).json(message);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // le controller pour récupérer les messages entre deux utilisateurs
    async getMessages (req, res) {
        try {
            const { userId, receiverId } = req.params;
            const messages = await messageService.getMessages(userId, receiverId);
            return res.status(200).json(messages);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },


    // le controller pour marquer les messages comme lus
    async markMessagesAsRead (req, res) {
        try {
            const { messageId } = req.params;
            const message = await messageService.markMessagesAsRead(messageId);
            if (!message) {
                return res.status(404).json({ error: 'Message non trouvé' });
            }
            return res.status(200).json({ message});
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // le controller pour supprimer un message
    async deleteMessage (req, res) {
        try {
            const { messageId } = req.params;
            if (!messageId) {
                return res.status(400).json({ error: 'ID de message manquant' });
            }
            const message = await messageService.deleteMessage(messageId);
            return res.status(200).json({ data: true, message: 'Message supprimé avec succès' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // le controller pour obtenir les noms des groupes de discussion d'un utilisateur
    async getGroupeName (req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({ error: 'ID utilisateur manquant' });
            }
            const users = await messageService.getGroupeName(userId);
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};