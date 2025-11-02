const express = require('express');
const router = express.Router();
const protocoloController = require('../controllers/protocoloController');

// CREATE
router.post('/', protocoloController.criarProtocolo);

// READ
router.get('/', protocoloController.buscarTodosProtocolos);
router.get('/:id', protocoloController.buscarProtocoloPorId);
router.get('/numero/:numeroProtocolo', protocoloController.buscarProtocoloPorNumero);

// UPDATE
router.put('/:id', protocoloController.atualizarProtocolo);

// DELETE
router.delete('/:id', protocoloController.deletarProtocolo);

module.exports = router;
