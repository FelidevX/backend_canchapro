const pool = require('../config/db');
const { sendEmail } = require('../config/email');

const crearEquipo = async (req, res) => {
    try {
        const {nombre, descripcion, ubicacion, nivel, id_dueno} = req.body;
        if(!nombre) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        const [result] = await pool.query(
            'INSERT INTO equipos (nombre, descripcion, ubicacion, nivel, id_dueno) VALUES (?, ?, ?, ?, ?)', [nombre, descripcion, ubicacion, nivel, id_dueno]
        );

        res.status(201).json({
            message: 'Equipo creado exitosamente',
            id: result.insertId,
            nombre: nombre,
            descripcion: descripcion,
            ubicacion: ubicacion,
            nivel: nivel,
            id_dueno: id_dueno
        });
    } catch(error) {
        console.error('Error al crear el equipo:', error);
        res.status(500).json({ message: 'Error al crear el equipo' }); 
    }
}

const obtenerEquipos = async (req, res) => {
    try {
        const [result] = await pool.query(`
            SELECT 
                e.id,
                e.nombre,
                e.descripcion,
                e.ubicacion,
                e.nivel,
                e.id_dueno,
                u.nombre as nombre_dueno,
                u.apellido as apellido_dueno,
                u.correo as correo_dueno
            FROM equipos e
            LEFT JOIN usuarios u ON e.id_dueno = u.id
        `);
        res.json(result);
    } catch(err){
        res.status(500).json({ message: 'Error al obtener los equipos', error: err.message })
    }
}

const obtenerEquipoPorId = async (req, res) => {
    const { id_dueno } = req.params;
    try {
        const [result] = await pool.query('SELECT e.id, e.nombre, e.descripcion, e.ubicacion, e.nivel FROM equipos e WHERE e.id_dueno = ?', [id_dueno]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }
        res.json(result[0]);
    } catch (error) {
        console.error('Error al obtener el equipo:', error);
        res.status(500).json({ message: 'Error al obtener el equipo' });
    }
}

const actualizarEquipo = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, ubicacion, nivel } = req.body;

    if (!nombre || !descripcion || !ubicacion || !nivel) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }   
    
    try {
        const [result] = await pool.query('UPDATE equipos SET nombre = ?, descripcion = ?, ubicacion = ?, nivel = ? WHERE id = ?', [nombre, descripcion, ubicacion, nivel, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }
        res.json({ message: 'Equipo actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el equipo:', error);
        res.status(500).json({ message: 'Error al actualizar el equipo' });
    }
}

const solicitudUnirseEquipo = async (req, res) => {
    const { id_equipo, id_usuario, fecha_solicitud, estado } = req.body;
    if (!id_equipo || !id_usuario || !fecha_solicitud || !estado) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    try {
        const fechaMysql = new Date(fecha_solicitud).toISOString().slice(0, 19).replace('T', ' ');
        const [result] = await pool.query(
            'INSERT INTO solicitudes_equipo (id_equipo, id_usuario, fecha_solicitud, estado) VALUES (?, ?, ?, ?)', 
            [id_equipo, id_usuario, fechaMysql, estado]
        );
        res.status(201).json({ message: 'Solicitud enviada exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al enviar solicitud:', error);
        res.status(500).json({ message: 'Error al enviar solicitud' });
    }
}

const listarSolicitudesPorEquipo = async (req, res) => {
    const { id_equipo } = req.params;
    try {
        const [result] = await pool.query('SELECT s.*, u.nombre, u.posicion FROM solicitudes_equipo s JOIN usuarios u ON s.id_usuario = u.id WHERE s.id_equipo = ?', [id_equipo]);
        
        res.json(result);
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        res.status(500).json({ message: 'Error al obtener solicitudes' });
    }
}

const aceptarSolicitud = async (req, res) => {
    const { id_solicitud } = req.params;

    try {
        const [result] = await pool.query('UPDATE solicitudes_equipo SET estado = "aceptada" WHERE id = ?', [id_solicitud]);

        if(result.affectedRows === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        res.json({ message: 'Solicitud aceptada exitosamente' });
    } catch (error) {
        console.error('Error al aceptar solicitud:', error);
        res.status(500).json({ message: 'Error al aceptar solicitud' });
    }
}

const rechazarSolicitud = async (req, res) => {
    const { id_solicitud } = req.params;

    try {
        const [result] = await pool.query('UPDATE solicitudes_equipo SET estado = "rechazada" WHERE id = ?', [id_solicitud]);

        if(result.affectedRows === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }
        res.json({ message: 'Solicitud rechazada exitosamente' });
    }catch (error) {
        console.error('Error al rechazar solicitud:', error);
        res.status(500).json({ message: 'Error al rechazar solicitud' });
    }
}

const agregarJugadorAEquipo = async (req, res) => {
    const { id_equipo, id_usuario, rol } = req.body;

    if (!id_equipo || !id_usuario || !rol) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO miembros_equipo (id_equipo, id_usuario, rol) VALUES (?, ?, ?)',
            [id_equipo, id_usuario, rol]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }

        res.status(201).json({ message: 'Jugador agregado al equipo exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al agregar jugador al equipo:', error);
        res.status(500).json({ message: 'Error al agregar jugador al equipo' });
    }
}

const obtenerJugadoresPorEquipo = async (req, res) => {
    const { id_equipo } = req.params;

    try {
        const [result] = await pool.query('SELECT u.id, u.nombre, u.posicion, me.rol FROM miembros_equipo me JOIN usuarios u ON me.id_usuario = u.id WHERE me.id_equipo = ?', [id_equipo]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'No hay jugadores en este equipo' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error al obtener jugadores del equipo:', error);
        res.status(500).json({ message: 'Error al obtener jugadores del equipo' });
    }
}

// Reta a un equipo y envía correo al capitán del equipo retado
const retarPartido = async (req, res) => {
    const { id_equipo, id_equipo_receptor } = req.body;
    if (!id_equipo || !id_equipo_receptor) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    try {
        // Insertar el reto en la base de datos (fecha y estado por default en la BD)
        const [retoResult] = await pool.query(
            'INSERT INTO retos (id_equipo, id_equipo_receptor) VALUES (?, ?)',
            [id_equipo, id_equipo_receptor]
        );

        // Obtener datos del equipo retador y su capitán
        const [retadorRows] = await pool.query(
            `SELECT e.nombre AS nombre_equipo, u.nombre AS nombre_capitan, u.apellido AS apellido_capitan, u.correo AS correo_capitan, u.telefono AS telefono_capitan
             FROM equipos e JOIN usuarios u ON e.id_dueno = u.id WHERE e.id = ?`,
            [id_equipo]
        );
        // Obtener correo del capitán del equipo retado
        const [retadoRows] = await pool.query(
            `SELECT e.nombre AS nombre_equipo, u.nombre AS nombre_capitan, u.apellido AS apellido_capitan, u.correo AS correo_capitan
             FROM equipos e JOIN usuarios u ON e.id_dueno = u.id WHERE e.id = ?`,
            [id_equipo_receptor]
        );

        if (!retadorRows.length || !retadoRows.length) {
            return res.status(404).json({ message: 'No se encontraron los equipos o capitanes.' });
        }

        const retador = retadorRows[0];
        const retado = retadoRows[0];

        // Log para depuración
        console.log('Correo del capitán del equipo retado:', retado.correo_capitan);
        console.log('Datos del equipo retado:', retado);

        // Preparar y enviar el correo
        const subject = `¡Has sido retado a un partido por ${retador.nombre_equipo}!`;
        const html = `
            <h2>¡Hola ${retado.nombre_capitan} ${retado.apellido_capitan}!</h2>
            <p>El equipo <strong>${retador.nombre_equipo}</strong> te ha retado a un partido.</p>
            <h3>Datos del equipo retador:</h3>
            <ul>
                <li><strong>Equipo:</strong> ${retador.nombre_equipo}</li>
                <li><strong>Capitán:</strong> ${retador.nombre_capitan} ${retador.apellido_capitan}</li>
                <li><strong>Correo del capitán:</strong> ${retador.correo_capitan}</li>
                <li><strong>Teléfono del capitán:</strong> ${retador.telefono_capitan}</li>
            </ul>
            <p>Puedes contactarte mediante correo electrónico o teléfono para acordar el encuentro!.</p>
        `;
        await sendEmail(retado.correo_capitan, subject, html);

        res.status(201).json({ message: 'Reto enviado y correo notificado exitosamente', id: retoResult.insertId });
    } catch (error) {
        console.error('Error al enviar reto:', error);
        res.status(500).json({ message: 'Error al enviar reto' });
    }
};

const obtenerEquipoCapitan = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const [result] = await pool.query(
            `SELECT e.* 
             FROM equipos e 
             JOIN miembros_equipo me ON e.id = me.id_equipo 
             WHERE me.id_usuario = ? AND me.rol = 'capitan' 
             LIMIT 1`,
            [id_usuario]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: 'No eres capitán de ningún equipo' });
        }
        res.json(result[0]);
    } catch (error) {
        console.error('Error al obtener el equipo donde es capitán:', error);
        res.status(500).json({ message: 'Error al obtener el equipo' });
    }
}

const eliminarJugadorEquipo = async (req, res) => {
    const { id_equipo, id_usuario } = req.params;

    if (!id_equipo || !id_usuario) {
        return res.status(404).json({ message: 'Faltan campos requeridos' });
    }

    try {
        const [result] = await pool.query(
            'DELETE FROM miembros_equipo WHERE id_equipo = ? AND id_usuario = ?', [id_equipo, id_usuario]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Jugador no encontrado en el equipo' });
        }

        res.json({ message: 'Jugador eliminado del equipo exitosamente' });
    } catch (error) {
        console.error('Error al eliminar jugador del equipo:', error);
        res.status(500).json({ message: 'Error al eliminar jugador del equipo' });
    }
}

module.exports = {
    crearEquipo,
    obtenerEquipos,
    obtenerEquipoPorId,
    actualizarEquipo,
    solicitudUnirseEquipo,
    listarSolicitudesPorEquipo,
    aceptarSolicitud,
    agregarJugadorAEquipo,
    obtenerJugadoresPorEquipo,
    rechazarSolicitud,
    retarPartido,
    obtenerEquipoCapitan,
    eliminarJugadorEquipo
}