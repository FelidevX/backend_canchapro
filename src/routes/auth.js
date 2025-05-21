const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { login, register, googleAuth, googleCallback } = require('../controllers/authController');
const { logout } = require('../controllers/userController');

router.post('/login', login);
router.post('/register', register);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/logout', authenticateToken, logout);

module.exports = router;
