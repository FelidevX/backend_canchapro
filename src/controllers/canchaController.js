const pool = require('../config/db');

const crearCancha = async (req, res) => {
    try {
        const { nombre, direccion, precio, descripcion, rating, id_dueno } = req.body;
        if (!nombre || !direccion || !precio || !descripcion || !id_dueno) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        const ratingValue = 1.0;

        const [result] = await pool.query(
            'INSERT INTO canchas (nombre, direccion, precio, descripcion, rating, id_dueno) VALUES (?, ?, ?, ?, ?, ?)', [nombre, direccion, precio, descripcion, ratingValue, id_dueno]
        );

        res.status(201).json({
            id: result.insertId,
            nombre,
            direccion,
            precio,
            descripcion,
            rating: ratingValue,
            id_dueno
        });
    } catch (error) {
        console.error('Error al crear cancha:', error);
        res.status(500).json({ message: 'Error al crear cancha', error: error.message });
    }
};

const obtenerCanchas = async (req, res) => {
    try {
        const [canchas] = await pool.query('SELECT * FROM canchas');
        res.json(canchas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener canchas', error: error.message });
    }
}

const obtenerCanchaPorDueno = async (req, res) => {
    try {
        const { id_dueno } = req.params;
        if (!id_dueno) {
            return res.status(400).json({ message: 'Falta el ID del dueño' });
        }
        const [canchas] = await pool.query('SELECT * FROM canchas WHERE id_dueno = ?', [id_dueno]);
        if (canchas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron canchas para este dueño' });
        }
        res.json(canchas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener canchas por dueño', error: error.message });
    }
}

const actualizarCancha = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, direccion, precio, descripcion } = req.body;
        if (!nombre || !direccion || !precio || !descripcion) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }
        const [result] = await pool.query(
            'UPDATE canchas SET nombre = ?, direccion = ?, precio = ?, descripcion = ? WHERE id = ?',
            [nombre, direccion, precio, descripcion, id]
        );
        res.json({ message: 'Cancha actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar cancha', error: error.message });
    }
}

const eliminarCancha = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM canchas WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cancha no encontrada' });
        }
        res.json({ message: 'Cancha eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar cancha', error: error.message });
    }
}

module.exports = { 
    crearCancha,
    obtenerCanchas,
    obtenerCanchaPorDueno,
    actualizarCancha,
    eliminarCancha
 };