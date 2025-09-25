import Message from "../models/Message.js";
import User from "../models/User.js";
import Agency from "../models/Agency/Agency.js";
import Client from "../models/clients/Client.js";
import mongoose from "mongoose";


// Envoyer un message
export const sendMessage = async (req, res) => {
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
export const getMessages = async (req, res) => {
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

export const getGroupeName = async (req, res) => {
  const userId = req.params.userId;
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
    
    console.log(users);
    const results = [];

    for (const user of users) {
      let details = {
        userId: user._id,
        role: user.role
      };

      if (user.role.toString() === 'client') {
        const client = await Client.findOne({ user: user._id });
        if (client) {
          details.firstName = client.firstName;
          details.lastName = client.lastName;
        }
      } else if (user.role.toString() === 'agency') {
        const agency = await Agency.findOne({ userId: user._id });
        if (agency) {
          details.agencyName = agency.agencyName;
        }
      }

      console.log(details);
      results.push(details);
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


    

// Récupérer les conversations d'un utilisateur
export const getConversations = async (req, res) => {
  const { userId } = req.params;
    try {
    const conversations = await Message.aggregate([
        { $match: { $or: [ { sender: userId }, { receiver: userId } ] } },
        { $sort: { createdAt: -1 } },
        { $group: {
            _id: {
              $cond: [
                { $eq: [ "$sender", userId ] },
                "$receiver",
                "$sender"
                ]
            },
            lastMessage: { $first: "$$ROOT" }
        }},
        { $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo"
        }},
        { $unwind: "$userInfo" },
        { $project: {
            _id: 0,
            userId: "$userInfo._id",
            firstName: "$userInfo.firstName",
            lastName: "$userInfo.lastName",
            email: "$userInfo.email",
            lastMessage: 1
        }},
        { $sort: { "lastMessage.createdAt": -1 } }
    ]);
    res.status(200).json({ conversations });
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Marquer les messages comme lus
export const markMessagesAsRead = async (req, res) => {
  const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }
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

// Compter les messages non lus pour un utilisateur
export const countUnreadMessages = async (req, res) => {
  const { userId } = req.params;
    try {
    const count = await Message.countDocuments({ receiver: userId, read: false });
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Erreur lors du comptage des messages non lus :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Supprimer une conversation entre deux utilisateurs
export const deleteConversation = async (req, res) => {
  const { userId1, userId2 } = req.params;
    try {
    const result = await Message.deleteMany({
        $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
        ]
    });
    res.status(200).json({ message: `${result.deletedCount} messages supprimés` });
  } catch (error) {
    console.error("Erreur lors de la suppression de la conversation :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// les messages 
export const getInbox = async (req, res) => {
    const { userId } = req.params;
    try {
        const messages = await Message.find({$or:[{ receiver: userId} , {sender: userId}]});
        res.status(200).json({ messages });
        //  const sentMessages = await Message.find({ sender: userId });
        // const receivedMessages = await Message.find({ receiver: userId });

        // const messages = {
        //     sent: sentMessages,
        //     received: receivedMessages
        // };

        // res.status(200).json({ messages });
    } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// marque comme lu
export const markAsRead = async (req, res) => {
    const { messageId } = req.params;
    try {
        const message = await Message.findByIdAndUpdate(messageId, { read: true }, { new: true });
        if (!message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        res.status(200).json({ message: "Message marqué comme lu", data: message });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du message :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Supprimer un message 
export const deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    try {
        const message = await Message.findByIdAndDelete(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        res.status(200).json({ message: "Message supprimé avec succès", data: message });
    } catch (error) {
        console.error("Erreur lors de la suppression du message :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};