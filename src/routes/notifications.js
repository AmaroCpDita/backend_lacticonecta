const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, notificationsController.getNotifications);
router.get('/unread-count', verifyToken, notificationsController.getUnreadCount);
router.put('/read', verifyToken, notificationsController.markAsRead);

module.exports = router;
