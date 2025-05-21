const pool = require('../config/db');

// Obtener información del usuario
const getUserInfo = async (req, res) => {
    try {
        const email = req.user.email;
        const [user] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [email]);
        
        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            id: user[0].id,
            lastName: user[0].apellido,
            email: user[0].correo,
            name: user[0].nombre,
            role: user[0].rol
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
};

// Cerrar sesión
const logout = async (req, res) => {
    try {
        res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cerrar sesión' });
    }
};

module.exports = {
    getUserInfo,
    logout
};