const express = require('express');
const router = express.Router();
const salasController = require('../controllers/salas');
const { verifyToken } = require('../middlewares/auth');

router.get('/', salasController.getSalas);
router.get('/:id', salasController.getSalaById);
router.post('/', salasController.createSala);
router.post('/:id/reviews', salasController.createReview);
router.post('/:id/save', verifyToken, salasController.saveSala);
router.delete('/:id/save', verifyToken, salasController.unsaveSala);

module.exports = router;
