const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserInfo, getUser, actualizarUsuario, obtenerUsuarios, actualizarRolUsuario} = require('../controllers/userController');

router.get('/', authenticateToken, getUserInfo);
router.get('/info/:id', authenticateToken, getUser);
router.put('/:id', authenticateToken, actualizarUsuario);
router.get('/all', authenticateToken, obtenerUsuarios);
router.put('/rol/:id', authenticateToken, actualizarRolUsuario);


module.exports = router; 