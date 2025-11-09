const { sendMessage, getMessages, getGroupeName, markMessagesAsRead, deleteMessage } = require('../services/message.js');


exports.sendMessage = async (req, res) => {
    await sendMessage(req, res);
};

exports.getMessages = async (req, res) => {
    await getMessages(req, res);
}

exports.getGroupeName = async (req, res) => {
    await getGroupeName(req, res);
}

exports.markMessagesAsRead = async (req, res) => {
    await markMessagesAsRead(req, res);
}

exports.deleteMessage = async (req, res) => {
    await deleteMessage(req, res);
}