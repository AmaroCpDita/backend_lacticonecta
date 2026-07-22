const express = require('express');
const router = express.Router();
const salasController = require('../controllers/salas');

router.get('/', salasController.getSalas);
router.get('/:id', salasController.getSalaById);
router.post('/', salasController.createSala);
router.post('/:id/reviews', salasController.createReview);

module.exports = router;
