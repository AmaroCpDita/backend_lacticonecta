const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const usersController = require('../controllers/users');
const { verifyToken } = require('../middlewares/auth');

// Configuración de multer para guardar en memoria (base64)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.put('/profile', verifyToken, upload.single('avatar'), usersController.updateProfile);
router.get('/profile', verifyToken, usersController.getProfile);
router.get('/saved-salas', verifyToken, usersController.getSavedSalas);
router.get('/search', verifyToken, usersController.searchUsers);
router.get('/profile/:id', verifyToken, usersController.getPublicProfile);
router.post('/:id/follow', verifyToken, usersController.followUser);
router.get('/:id/followers', verifyToken, usersController.getFollowers);
router.get('/:id/following', verifyToken, usersController.getFollowing);

module.exports = router;
