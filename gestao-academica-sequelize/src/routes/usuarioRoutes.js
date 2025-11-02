const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// CREATE
router.post('/', usuarioController.criarUsuario);

// READ
router.get('/', usuarioController.buscarTodosUsuarios);
router.get('/:id', usuarioController.buscarUsuarioPorId);

// UPDATE
router.put('/:id', usuarioController.atualizarUsuario);

// DELETE
router.delete('/:id', usuarioController.deletarUsuario); // Soft delete
router.delete('/:id/permanente', usuarioController.deletarUsuarioPermanente); // Hard delete

module.exports = router;
