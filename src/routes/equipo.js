const express = require('express');
const router = express.Router();
const { crearEquipo, obtenerEquipos, obtenerEquipoPorId, actualizarEquipo, solicitudUnirseEquipo, listarSolicitudesPorEquipo, aceptarSolicitud, agregarJugadorAEquipo, obtenerJugadoresPorEquipo, rechazarSolicitud, retarPartido, obtenerEquipoCapitan, eliminarJugadorEquipo} = require('../controllers/equipoController');

router.post('/', crearEquipo);
router.get('/', obtenerEquipos);
router.get('/:id_dueno', obtenerEquipoPorId);
router.put('/:id', actualizarEquipo);
router.post('/solicitud', solicitudUnirseEquipo);
router.get('/solicitudes/:id_equipo', listarSolicitudesPorEquipo);
router.put('/solicitud/aceptar/:id_solicitud', aceptarSolicitud);
router.post('/jugador', agregarJugadorAEquipo);
router.get('/jugador/:id_equipo', obtenerJugadoresPorEquipo);
router.put('/solicitud/rechazar/:id_solicitud', rechazarSolicitud);
router.post('/retar', retarPartido);
router.get('/capitan/:id_usuario', obtenerEquipoCapitan);
router.delete('/jugador/:id_equipo/:id_usuario', eliminarJugadorEquipo);

module.exports = router;