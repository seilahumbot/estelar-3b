require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
app.use(errorHandler);

module.exports = app;
