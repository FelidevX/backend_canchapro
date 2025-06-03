const pool = require('../config/db');

const crearCancha = async (req, res) => {
    try {
        const { nombre, direccion, precio, descripcion, id_dueno } = req.body;
        if (!nombre || !direccion || !precio || !descripcion || !id_dueno) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        const [result] = await pool.query(
            'INSERT INTO canchas (nombre, direccion, precio, descripcion, id_dueno) VALUES (?, ?, ?, ?, ?)', [nombre, direccion, precio, descripcion, id_dueno]
        );

        res.status(201).json({
            id: result.insertId,
            nombre,
            direccion,
            precio,
            descripcion,
            id_dueno
        });
    } catch (error) {
        console.error('Error al crear cancha:', error);
        res.status(500).json({ message: 'Error al crear cancha', error: error.message });
    }
};

module.exports = { crearCancha };