const pool = require('../config/db');

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
        const [result] = await pool.query('INSERT INTO solicitudes_equipo (id_equipo, id_usuario, fecha_solicitud, estado) VALUES (?, ?, ?, ?)', [id_equipo, id_usuario, fecha_solicitud, estado]);
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
    rechazarSolicitud
}