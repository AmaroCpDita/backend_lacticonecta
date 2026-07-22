const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointments');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, appointmentsController.getAppointments);
router.post('/', verifyToken, appointmentsController.createAppointment);

module.exports = router;
