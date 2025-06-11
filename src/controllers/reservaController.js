const pool = require('../config/db');

const crearReserva = async (req, res) => {
    try {
        const { fecha, hora_inicio, hora_fin, estado, id_usuario, id_cancha } = req.body;
        if (!fecha || !hora_inicio || !hora_fin || !estado || !id_usuario || !id_cancha) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        const [reservasSolapadas] = await pool.query(
            `SELECT * FROM reservas WHERE id_cancha = ? AND fecha = ? AND (
            (hora_inicio < ? AND hora_fin > ?) OR (hora_inicio < ? AND hora_fin > ?) OR
            (hora_inicio >= ? AND hora_fin <= ?)
            ) AND estado = 'ocupado'`,
            [id_cancha, fecha, hora_inicio, hora_inicio, hora_fin, hora_fin, hora_inicio, hora_fin]
        );

        if( reservasSolapadas.length > 0 ) {
            return res.status(400).json({ message: 'La cancha ya está reservada en este horario' });
        }

        const estadoValue = estado || 'ocupado';

        const [result] = await pool.query(
            'INSERT INTO reservas (fecha, hora_inicio, hora_fin, estado, id_usuario, id_cancha) VALUES (?, ?, ?, ?, ?, ?)',
            [fecha, hora_inicio, hora_fin, estadoValue, id_usuario, id_cancha]
        );

        res.status(201).json({
            id: result.insertId,
            fecha,
            hora_inicio,
            hora_fin,
            estado: estadoValue,
            id_usuario,
            id_cancha
        });
    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({ message: 'Error al crear reserva', error: error.message });
    }
}

const obtenerReservasPorDueno = async (req, res) => {
    try {
        const { id_dueno } = req.params;
        const [canchas] = await pool.query('SELECT * FROM canchas WHERE id_dueno = ?', [id_dueno]);
        if (canchas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron canchas para este usuario' });
        }

        const idsCanchas = canchas.map(c => c.id);
        if (idsCanchas.length === 0) {
            return res.json([]);
        }

        const [reservas] = await pool.query(
            `
            SELECT r.id, r.fecha, r.hora_inicio, r.hora_fin, r.estado, r.id_usuario, r.id_cancha, c.nombre AS nombre_cancha, u.nombre AS nombre_cliente
            FROM reservas r
            JOIN canchas c ON r.id_cancha = c.id
            JOIN usuarios u ON r.id_usuario = u.id
            WHERE r.id_cancha IN (${idsCanchas.map(() => '?').join(',')})
            `,
            idsCanchas
        );
        res.json(reservas);

    } catch (error) {
        console.error('Error al obtener reservas por dueño:', error);
        res.status(500).json({ message: 'Error al obtener reservas por dueño', error: error.message });
    }
}

module.exports = {
    crearReserva,
    obtenerReservasPorDueno
};