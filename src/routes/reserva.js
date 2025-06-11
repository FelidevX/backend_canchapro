const express = require('express');
const router = express.Router();
const { crearReserva, obtenerReservasPorDueno } = require('../controllers/reservaController');

router.post('/', crearReserva);
router.get('/:id_dueno', obtenerReservasPorDueno);

module.exports = router;