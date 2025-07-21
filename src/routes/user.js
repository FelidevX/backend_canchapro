const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserInfo, getUser, actualizarUsuario} = require('../controllers/userController');

router.get('/', authenticateToken, getUserInfo);
router.get('/info/:id', authenticateToken, getUser);
router.put('/:id', authenticateToken, actualizarUsuario);

module.exports = router; 