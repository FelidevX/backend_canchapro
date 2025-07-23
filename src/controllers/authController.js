/**
 * Controlador de autenticación que maneja el login, registro y autenticación con Google
 * Utiliza bcrypt para el hash de contraseñas y JWT para la generación de tokens
 */
const { sendEmail } = require('../config/email'); // Agrega al inicio
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { oAuth2Client, JWT_SECRET, CLIENT_ID } = require('../config/auth');

/**
 * Maneja el proceso de inicio de sesión de usuarios
 * Verifica las credenciales y genera un token JWT
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [user] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [email]);
        
        if (user.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user[0].contrasena);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { 
                id: user[0].id, 
                email: user[0].correo,
                role: user[0].rol 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user[0].id,
                email: user[0].correo,
                name: user[0].nombre,
                role: user[0].rol
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};

/**
 * Maneja el registro de nuevos usuarios
 * Verifica que el correo no esté registrado y crea un nuevo usuario
 */
const register = async (req, res) => {
    const { name, lastname, phone, email, password } = req.body;
    try {
        const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, apellido, telefono, correo, contrasena, rol) VALUES (?, ?, ?, ?, ?, ?)',
            [name, lastname, phone, email, hashedPassword, 'jugador']
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente' });

     const subject = '👋 ¡Bienvenido a CanchaPro!';
     const html = `
      <h2>Hola ${name},</h2>
      <p>Tu cuenta ha sido creada exitosamente.</p>
      <p>Ahora puedes reservar canchas y disfrutar de nuestros servicios.</p>
      `;
      await sendEmail(email, subject, html);

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
 
  };

/**
 * Inicia el proceso de autenticación con Google
 * Genera y redirige a la URL de autenticación de Google
 */
const googleAuth = (req, res) => {
    const url = oAuth2Client.generateAuthUrl({
        scope: ['profile', 'email'],
        redirect_uri: process.env.BACKEND_URL + '/auth/google/callback',
    });
    res.redirect(url);
};

/**
 * Maneja el callback de autenticación de Google
 * Procesa la información del usuario y crea/actualiza el registro en la base de datos
 */
const googleCallback = async (req, res) => {
    const code = req.query.code;
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        const ticket = await oAuth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userInfo = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            surname: payload.family_name || '',
        };

        const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [userInfo.email]);
        
        let userId;
        let userRole;
        if(existingUser.length === 0){
            const [result] = await pool.query('INSERT INTO usuarios (nombre, apellido, correo, rol) VALUES (?, ?, ?, ?)',
            [userInfo.name, userInfo.surname, userInfo.email, 'jugador']);
            userId = result.insertId;
            userRole = 'jugador';
        } else {
            userId = existingUser[0].id;
            userRole = existingUser[0].rol;
        }

        // Generar un token JWT para mantener consistencia con el login normal
        const token = jwt.sign(
            { 
                id: userId, 
                email: userInfo.email,
                role: userRole
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Redirigir a la página principal con los datos necesarios
        res.redirect(process.env.FRONTEND_URL + `/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: userId,
            email: userInfo.email,
            name: userInfo.name,
            role: userRole
        }))}`);
    } catch (error) {
        console.error('Error en autenticación:', error);
        res.status(500).send('Error en autenticación');
    }
};




module.exports = {
    login,
    register,
    googleAuth,
    googleCallback
}; 