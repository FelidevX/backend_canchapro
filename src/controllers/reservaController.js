const pool = require('../config/db');
const { sendEmail } = require('../config/email');

const crearReserva = async (req, res) => {
    try {
        const { fecha, hora_inicio, hora_fin, estado, id_usuario, id_cancha } = req.body;
        if (!fecha || !hora_inicio || !hora_fin || !estado || !id_usuario || !id_cancha) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        const [canchaRows] = await pool.query('SELECT precio FROM canchas WHERE id = ?', [id_cancha]);
        if (canchaRows.length === 0) {
            return res.status(404).json({ message: 'Cancha no encontrada' });
        }
        const precio = parseFloat(canchaRows[0].precio);

        const inicio = parseInt(hora_inicio.split(':')[0]);
        const fin = parseInt(hora_fin.split(':')[0]);
        const duracion = fin - inicio;
        const valor_reserva = precio * duracion;

        const [reservasSolapadas] = await pool.query(
            `SELECT * FROM reservas WHERE id_cancha = ? AND fecha = ? AND (
            (hora_inicio < ? AND hora_fin > ?) OR (hora_inicio < ? AND hora_fin > ?) OR
            (hora_inicio >= ? AND hora_fin <= ?)
            ) AND estado = 'Confirmada'`,
            [id_cancha, fecha, hora_inicio, hora_inicio, hora_fin, hora_fin, hora_inicio, hora_fin]
        );

        if( reservasSolapadas.length > 0 ) {
            return res.status(400).json({ message: 'La cancha ya está reservada en este horario' });
        }

        const estadoValue = estado || 'Confirmada';

        const [result] = await pool.query(
            'INSERT INTO reservas (fecha, hora_inicio, hora_fin, estado, id_usuario, id_cancha) VALUES (?, ?, ?, ?, ?, ?)',
            [fecha, hora_inicio, hora_fin, estadoValue, id_usuario, id_cancha]
        );



                const [user] = await pool.query('SELECT correo, nombre FROM usuarios WHERE id = ?', [id_usuario]);
        const [cancha] = await pool.query('SELECT nombre FROM canchas WHERE id = ?', [id_cancha]);

        // 3. Enviar correo de confirmación
         const subject = '✅ Reserva confirmada en CanchaPro';
        const html = `
         <h2>¡Reserva exitosa!</h2>
        <p><strong>Cancha:</strong> ${cancha[0].nombre}</p>
         <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Horario:</strong> ${hora_inicio} - ${hora_fin}</p>
        <p>Gracias por usar CanchaPro. Presenta este correo al llegar.</p>
        `;

        await sendEmail(user[0].correo, subject, html);

        res.status(201).json({
            id: result.insertId,
            fecha,
            hora_inicio,
            hora_fin,
            estado: estadoValue,
            id_usuario,
            id_cancha,
            valor_reserva
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
            SELECT r.id, r.fecha, r.hora_inicio, r.hora_fin, r.estado, r.id_usuario, r.id_cancha, c.nombre AS nombre_cancha, u.nombre AS nombre_cliente, c.precio * (HOUR(r.hora_fin) - HOUR(r.hora_inicio)) AS valor_reserva FROM reservas r JOIN canchas c ON r.id_cancha = c.id JOIN usuarios u ON r.id_usuario = u.id WHERE r.id_cancha IN (${idsCanchas.map(() => '?').join(',')})`, idsCanchas);
        res.json(reservas);

    } catch (error) {
        console.error('Error al obtener reservas por dueño:', error);
        res.status(500).json({ message: 'Error al obtener reservas por dueño', error: error.message });
    }
}

const actualizarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, hora_inicio, hora_fin, estado, id_usuario, id_cancha } = req.body;

        const [reservas] = await pool.query('SELECT * FROM reservas WHERE id = ?', [id]);
        if (reservas.length === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        await pool.query(
            'UPDATE reservas SET fecha = ?, hora_inicio = ?, hora_fin = ?, estado = ?, id_usuario = ?, id_cancha = ? WHERE id = ?',
            [fecha, hora_inicio, hora_fin, estado, id_usuario, id_cancha, id]
        );

        res.json({ message: 'Reserva actualizada correctamente' });
    }catch (error) {
        console.error('Error al actualizar reserva:', error);
        res.status(500).json({ message: 'Error al actualizar reserva', error: error.message });
    }
}

module.exports = {
    crearReserva,
    obtenerReservasPorDueno,
    actualizarReserva
};