// Configuración de la base de datos
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
host: 'localhost',
user: 'root',
password: '',
database: 'canchapro',
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0,
});

module.exports = pool;

