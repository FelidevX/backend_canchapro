const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const canchaRoutes = require('./routes/cancha');
const reservaRoutes = require('./routes/reserva');
const equipoRoutes = require('./routes/equipo');

const app = express();

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/canchas', canchaRoutes);
app.use('/reservas', reservaRoutes);
app.use('/equipos', equipoRoutes);

module.exports = app;