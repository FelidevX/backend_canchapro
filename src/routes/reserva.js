const express = require('express');
const router = express.Router();
const { crearReserva, obtenerReservasPorDueno, actualizarReserva } = require('../controllers/reservaController');

router.post('/', crearReserva);
router.get('/:id_dueno', obtenerReservasPorDueno);
router.put('/:id', actualizarReserva);

module.exports = router;