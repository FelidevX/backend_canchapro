const jwt = require('jsonwebtoken');
const { oAuth2Client, JWT_SECRET, CLIENT_ID } = require('../config/auth');

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        // Verificar si es un token de Google o JWT
        if (token.startsWith('ya29.')) {
            const ticket = await oAuth2Client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID,
            });
            req.user = ticket.getPayload();
        } else {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido' });
    }
};

module.exports = {
    authenticateToken
};