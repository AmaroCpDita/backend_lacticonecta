const express = require('express');
const { chatWithAI } = require('../controllers/chat');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// Protected route to ensure only logged in users can use the AI
router.post('/', verifyToken, chatWithAI);

module.exports = router;
