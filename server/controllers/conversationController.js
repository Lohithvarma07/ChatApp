// server/controllers/conversationController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Create a new conversation
async function createConversation(req, res) {
  try {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'senderId and receiverId required' });
    }

    // check if exists already
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [senderId, receiverId] });
    }

    return res.status(201).json(conversation);
  } catch (err) {
    console.error('createConversation error:', err);
    return res.status(500).json({ message: err.message });
  }
}

// Get messages of a conversation
async function getMessages(req, res) {
  try {
    const messages = await Message.find({ conversation: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Send a message inside a conversation
async function sendMessage(req, res) {
  try {
    const { senderId, text } = req.body;
    const conversationId = req.params.id;

    if (!conversationId || !senderId || !text) {
      return res.status(400).json({ message: 'conversationId, senderId and text are required' });
    }

    const message = await Message.create({
      conversation: conversationId,
      from: senderId,
      text,
      status: 'sent',
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createConversation, getMessages, sendMessage };
