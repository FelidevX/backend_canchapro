const pool = require('../config/db');

const getUser = async (req, res) => {
    try {
        const { id } = req.params; 
        const [user] = await pool.query('SELECT id, nombre, apellido, correo, rol, telefono, posicion FROM usuarios WHERE id = ?', [id]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            id: user[0].id,
            lastName: user[0].apellido,
            email: user[0].correo,
            name: user[0].nombre,
            role: user[0].rol,
            telefono: user[0].telefono,
            position: user[0].posicion,
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
}

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

const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, lastName, telefono, position } = req.body;
        if (!name || !lastName || !position) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }
        const [result] = await pool.query(
            'UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?, posicion = ? WHERE id = ?',
            [name, lastName, telefono, position, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado exitosamente' });
    }catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
}

const actualizarRolUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ message: 'El rol es requerido' });
        }
        const [result] = await pool.query(
            'UPDATE usuarios SET rol = ? WHERE id = ?',
            [role, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Rol actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({ message: 'Error al actualizar rol' });
    }
};

const obtenerUsuarios = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, nombre, apellido, correo, rol FROM usuarios');
        res.json(users.map(user => ({
            id: user.id,
            name: user.nombre,
            lastName: user.apellido,
            email: user.correo,
            role: user.rol
        })));
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
}

module.exports = {
    getUserInfo,
    logout,
    getUser,
    actualizarUsuario,
    actualizarRolUsuario,
    obtenerUsuarios
};