const express = require('express');
const router = express.Router();
const { crearCancha, obtenerCanchas, obtenerCanchaPorDueno, actualizarCancha, eliminarCancha } = require('../controllers/canchaController');

router.post('/', crearCancha);
router.get('/', obtenerCanchas);
router.get('/dueno/:id_dueno', obtenerCanchaPorDueno);
router.put('/:id', actualizarCancha);
router.delete('/:id', eliminarCancha);


module.exports = router;