const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usuarioRoutes = require('./routes/usuarioRoutes');
const protocoloRoutes = require('./routes/protocoloRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/protocolos', protocoloRoutes);

// Rota inicial
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Sistema de Gestão Acadêmica',
    versao: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      protocolos: '/api/protocolos'
    }
  });
});

// Middleware de erro 404
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    erro: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
