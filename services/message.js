const Message = require('../models/Message.js');
const User = require('../models/User.js');

// Envoyer un message
exports.sendMessage = async (req, res) => {
  const { sender, receiver, content } = req.body;
  if (!sender || !receiver || !content) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }
  try {
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.status(201).json({ message: "Message envoyé avec succès", data: message });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Récupérer les messages entre deux utilisateurs
exports.getMessages = async (req, res) => {
  const { userId, receiverId } = req.params;
    try {
    const messages = await Message.find({
        $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
exports.getGroupeName = async (req, res) => {
  const {userId} = req.params;
  try {
    console.log(userId);
    const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] });
   
    console.log("messages" + messages);
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
    console.log(ids);
    const users = await User.find({ _id: { $in: ids } });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Erreur lors de la récupération des noms de groupe :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const result = await Message.updateMany(
      { sender: senderId, receiver: receiverId, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: `${result.nModified} messages marqués comme lus` });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des messages :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  try {
    const message = await Message.findByIdAndDelete(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message non trouvé" });
    }
    res.status(200).json({ message: "Message supprimé avec succès", data: message });
  } catch (error) {
    console.error("Erreur lors de la suppression du message :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};