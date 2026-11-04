const clienteService = require('../services/clienteService');

class ClienteController {
  async listar(req, res) {
    try {
      const { busca } = req.query;
      const clientes = await clienteService.listar(busca);
      return res.status(200).json(clientes);
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao buscar clientes.' });
    }
  }

  async criar(req, res) {
    try {
      const novoCliente = await clienteService.criar(req.body);
      return res.status(201).json(novoCliente);
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao criar cliente.' });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const clienteAtualizado = await clienteService.atualizar(id, req.body);
      return res.status(200).json(clienteAtualizado);
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao atualizar cliente.' });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await clienteService.deletar(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao deletar cliente.' });
    }
  }
}

module.exports = new ClienteController();