// Biblioteca de autenticación de Google
const { OAuth2Client } = require('google-auth-library');

// Configuración de las credenciales de OAuth2 para Google
// Estas variables deben estar definidas en el archivo .env
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;        // ID del cliente de Google OAuth
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // Secreto del cliente de Google OAuth
const REDIRECT_URI = 'http://localhost:3000/auth/google/callback'; // URL de redirección después de la autenticación
const JWT_SECRET = process.env.JWT_SECRET || 'secretjwt';     // Secreto para firmar los tokens JWT

// Creamos una instancia del cliente OAuth2 con las credenciales configuradas
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Exportamos las configuraciones necesarias para otros archivos
module.exports = {
    oAuth2Client,  // Cliente OAuth2 configurado
    JWT_SECRET,    // Secreto para JWT
    CLIENT_ID      // ID del cliente de Google
}; 