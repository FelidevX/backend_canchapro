// Biblioteca de autenticación de Google
const { OAuth2Client } = require('google-auth-library');

// Configuración de las credenciales de OAuth2 para Google
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;        // ID del cliente de Google OAuth
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // Secreto del cliente de Google OAuth
const REDIRECT_URI = process.env.BACKEND_URL + '/auth/google/callback'; // URL de redirección después de la autenticación
const JWT_SECRET = process.env.JWT_SECRET || 'secretjwt';     // Secreto para firmar los tokens JWT

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

module.exports = {
    oAuth2Client, 
    JWT_SECRET,   
    CLIENT_ID      
}; 