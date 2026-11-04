const { Router } = require('express');
const agendamentoController = require('../controllers/agendamentoController');

const router = Router();

router.get('/', agendamentoController.listar);
router.post('/', agendamentoController.criar);
router.put('/:id', agendamentoController.atualizarData);
router.delete('/:id', agendamentoController.deletar);

module.exports = router;