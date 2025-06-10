const pool = require('../config/db');
const { sendEmail } = require('../config/email');

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
            id_cancha
        });





    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({ message: 'Error al crear reserva', error: error.message });
    }
}

module.exports = {
    crearReserva
};