const Message = require('../models/Message.js');
const User = require('../models/User.js');
const Agency = require('../models/agency.js');


//exports des fonctions de service de message dans un seul objet
exports.messageService = {

// Fonction pour envoyer un message
  async sendMessage (data) {
    if (!data) throw new Error('Données de message manquantes');
    const { sender, receiver, content } = data;

    const message = new Message({ sender, receiver, content });
    await message.save();
    return message;
  },

  // Fonction pour récupérer les messages entre deux utilisateurs
  async getMessages (userId, receiverId) {
    if (!userId || !receiverId) throw new Error('IDs utilisateur manquants');
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
    return messages;
  },

  // Fonction pour marquer les messages comme lus
  async markMessagesAsRead (messageId) {
    if (!messageId) throw new Error('IDs utilisateur manquants');
    const result = await Message.findAndUpdate(
      { _id: messageId, read: false },
      { $set: { read: true } },
      { new: true }
    );
    return result;
  },

  // Fonction pour supprimer un message
  async deleteMessage (messageId) {
    if (!messageId) throw new Error('ID de message manquant');
    const message = await Message.findByIdAndDelete(messageId);
    if (!message) throw new Error('Message non trouvé');
    return message;
  },

  // Fonction pour obtenir les noms des groupes de discussion d'un utilisateur
  async getGroupeName (userId) {
    if (!userId) throw new Error('ID utilisateur manquant');
    const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] });
    const interlocutorIds = new Set();

    messages.forEach(msg => {
      if (msg.sender.toString() !== userId.toString()) {
        interlocutorIds.add(msg.sender.toString());
      }
      if (msg.receiver.toString() !== userId.toString()) {
        interlocutorIds.add(msg.receiver.toString());
      }
    });
    const ids = Array.from(interlocutorIds);
    const users = await User.find({ _id: { $in: ids } });
    const agency = await Agency.find({ _id: { $in: ids } });
    // const all = {...users, ...agency};
    const all = [users, agency];
    return all;
  },

  async getUserMessages(userId) {
    if (!userId) throw new Error('ID utilisateur manquant');
    const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
      .sort({ createdAt: -1 });
    return messages;
  },

  async getUserMessagesUnread(userId) {
    if (!userId) throw new Error('ID utilisateur manquant');
    const messages = await Message.find({ receiver: userId, read: false })
      .sort({ createdAt: -1 });
    return messages;
  }
};