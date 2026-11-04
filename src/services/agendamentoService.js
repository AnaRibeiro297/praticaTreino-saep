const agendamentoRepository = require('../repositories/agendamentoRepository');
const { decrypt } = require('../utils/crypto');

class AgendamentoService {
  async listar() {
    const agendamentos = await agendamentoRepository.findAllWithRelations();
    return agendamentos.map(item => ({
      ...item,
      cliente_cpf: decrypt(item.cliente_cpf)
    }));
  }

  async criar({ data_agendamento, descricao, veiculo_id }) {
    if (!veiculo_id || !data_agendamento) {
      throw { status: 400, mensagem: 'Data e veiculo_id são obrigatórios.' };
    }
    return await agendamentoRepository.create(data_agendamento, descricao, veiculo_id);
  }

  async atualizarData(id, { data_agendamento }) {
    if (!data_agendamento) {
      throw { status: 400, mensagem: 'A nova data de agendamento é obrigatória.' };
    }
    const agendamentoAtualizado = await agendamentoRepository.updateDate(id, data_agendamento);
    if (!agendamentoAtualizado) throw { status: 404, mensagem: 'Agendamento não encontrado.' };

    return agendamentoAtualizado;
  }

  async deletar(id) {
    const agendamentoDeletado = await agendamentoRepository.delete(id);
    if (!agendamentoDeletado) throw { status: 404, mensagem: 'Agendamento não encontrado.' };
    return agendamentoDeletado;
  }
}

module.exports = new AgendamentoService();