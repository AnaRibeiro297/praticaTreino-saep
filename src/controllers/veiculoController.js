const veiculoService = require('../services/veiculoService');

class VeiculoController {
  async listar(req, res) {
    try {
      const veiculos = await veiculoService.listar();
      return res.status(200).json(veiculos);
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao buscar veículos.' });
    }
  }

  async criar(req, res) {
    try {
      const novoVeiculo = await veiculoService.criar(req.body);
      return res.status(201).json(novoVeiculo);
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao criar veículo.' });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const veiculoAtualizado = await veiculoService.atualizar(id, req.body);
      return res.status(200).json(veiculoAtualizado);
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao atualizar veículo.' });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await veiculoService.deletar(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao deletar veículo.' });
    }
  }
}

module.exports = new VeiculoController();