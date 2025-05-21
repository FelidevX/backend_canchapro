const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserInfo } = require('../controllers/userController');

router.get('/', authenticateToken, getUserInfo);

module.exports = router; 