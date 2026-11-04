const { Router } = require('express');
const veiculoController = require('../controllers/veiculoController');

const router = Router();

router.get('/', veiculoController.listar);
router.post('/', veiculoController.criar);
router.put('/:id', veiculoController.atualizar);
router.delete('/:id', veiculoController.deletar);

module.exports = router;