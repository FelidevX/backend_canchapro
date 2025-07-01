const express = require('express');
const router = express.Router();
const { crearEquipo, obtenerEquipos } = require('../controllers/equipoController');

router.post('/', crearEquipo);
router.get('/', obtenerEquipos);

module.exports = router;