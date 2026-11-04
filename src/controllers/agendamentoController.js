const agendamentoService = require('../services/agendamentoService');

class AgendamentoController {
  async listar(req, res) {
    try {
      const agendamentos = await agendamentoService.listar();
      return res.status(200).json(agendamentos);
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao buscar agendamentos.' });
    }
  }

  async criar(req, res) {
    try {
      const novoAgendamento = await agendamentoService.criar(req.body);
      return res.status(201).json(novoAgendamento);
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao criar agendamento.' });
    }
  }

  async atualizarData(req, res) {
    try {
      const { id } = req.params;
      const agendamentoAtualizado = await agendamentoService.atualizarData(id, req.body);
      return res.status(200).json(agendamentoAtualizado);
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao atualizar agendamento.' });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await agendamentoService.deletar(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao deletar agendamento.' });
    }
  }
}

module.exports = new AgendamentoController();