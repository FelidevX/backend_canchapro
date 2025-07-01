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

module.exports = {
    crearEquipo,
    obtenerEquipos
}