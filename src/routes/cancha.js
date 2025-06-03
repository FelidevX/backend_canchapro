const express = require('express');
const router = express.Router();
const { crearCancha } = require('../controllers/canchaController');

router.post('/', crearCancha);

module.exports = router;