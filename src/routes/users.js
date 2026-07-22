const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const usersController = require('../controllers/users');
const { verifyToken } = require('../middlewares/auth');

// Configuración de multer para guardar en la carpeta /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.put('/profile', verifyToken, upload.single('avatar'), usersController.updateProfile);
router.get('/profile', verifyToken, usersController.getProfile);
router.get('/search', verifyToken, usersController.searchUsers);
router.get('/profile/:id', verifyToken, usersController.getPublicProfile);
router.post('/:id/follow', verifyToken, usersController.followUser);

module.exports = router;
