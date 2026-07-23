const express = require('express');
const { getChats, getChatMessages, createChat, deleteChat, chatWithAI } = require('../controllers/chat');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// All routes are protected
router.get('/', verifyToken, getChats);           // List all chats
router.post('/', verifyToken, chatWithAI);          // Send message to AI
router.post('/new', verifyToken, createChat);       // Create new chat
router.get('/:id', verifyToken, getChatMessages);   // Get chat messages
router.delete('/:id', verifyToken, deleteChat);     // Delete chat

module.exports = router;
