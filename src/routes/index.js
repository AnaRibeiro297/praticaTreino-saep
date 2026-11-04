const { Router } = require('express');
const authRoutes = require('./authRoutes');
const clienteRoutes = require('./clienteRoutes');
const veiculoRoutes = require('./veiculoRoutes');
const agendamentoRoutes = require('./agendamentoRoutes');
const { verifyToken } = require('../middlewares/auth');

const router = Router();


router.use('/', authRoutes);


router.use('/clientes', verifyToken, clienteRoutes);
router.use('/veiculos', verifyToken, veiculoRoutes);
router.use('/agendamentos', verifyToken, agendamentoRoutes);

module.exports = router;