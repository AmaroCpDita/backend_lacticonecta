const express = require('express');
const router = express.Router();
const multer = require('multer');
const salasController = require('../controllers/salas');
const { verifyToken } = require('../middlewares/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', salasController.getSalas);
router.get('/:id', salasController.getSalaById);
router.post('/', salasController.createSala);
router.post('/:id/reviews', verifyToken, salasController.createReview);
router.post('/:id/reviews/:reviewId/vote', verifyToken, salasController.voteReview);
router.delete('/:id/reviews/:reviewId', verifyToken, salasController.deleteReview);
router.post('/:id/save', verifyToken, salasController.saveSala);
router.delete('/:id/save', verifyToken, salasController.unsaveSala);

module.exports = router;
