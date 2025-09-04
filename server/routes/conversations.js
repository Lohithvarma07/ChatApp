// server/routes/conversations.js
const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../utils/authMiddleware');
const conversationController = require('../controllers/conversationController');

// Debug: uncomment if you’re still getting errors
// console.log('conversation controller keys:', Object.keys(conversationController));

router.post('/', verifyJWT, conversationController.createConversation);
router.get('/:id/messages', verifyJWT, conversationController.getMessages);
router.post('/:id/messages', verifyJWT, conversationController.sendMessage);

module.exports = router;
