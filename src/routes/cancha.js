const express = require('express');
const router = express.Router();
const { crearCancha, obtenerCanchas } = require('../controllers/canchaController');

router.post('/', crearCancha);
router.get('/', obtenerCanchas);

module.exports = router;