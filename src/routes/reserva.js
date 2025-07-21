const express = require('express');
const router = express.Router();
const { crearReserva, obtenerReservasPorDueno, actualizarReserva } = require('../controllers/reservaController');
const { crearPreferenciaReserva } = require('../services/mercadopagoService');

router.post('/', crearReserva);
router.get('/:id_dueno', obtenerReservasPorDueno);
router.put('/:id', actualizarReserva);
router.post('/pago', async (req, res) => {
  try {
    const { precio } = req.body;
    const urlPago = await crearPreferenciaReserva({ precio });
    res.json({ url: urlPago });
  } catch (error) {
    console.error('Error MercadoPago:', error);
    res.status(500).json({ error: error.message || 'Error al crear preferencia de pago' });
  }
});

module.exports = router;