const express = require('express');
const routes = express.Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'API rodando com sucesso!' });
});

module.exports = routes;