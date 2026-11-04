const veiculoRepository = require('../repositories/veiculoRepository');
const clienteRepository = require('../repositories/clienteRepository');

class VeiculoService {
  async listar() {
    return await veiculoRepository.findAll();
  }

  async criar({ placa, modelo, marca, ano, cliente_id }) {
    if (!cliente_id) {
      throw { status: 400, mensagem: 'O campo cliente_id é obrigatório.' };
    }

    const clienteExiste = await clienteRepository.findById(cliente_id);
    if (!clienteExiste) {
      throw { status: 400, mensagem: 'Cliente não encontrado para o cliente_id fornecido.' };
    }

    return await veiculoRepository.create(placa, modelo, marca, ano, cliente_id);
  }

  async atualizar(id, { placa, modelo, marca, ano, cliente_id }) {
    if (!cliente_id) {
      throw { status: 400, mensagem: 'O campo cliente_id é obrigatório.' };
    }

    const veiculoAtualizado = await veiculoRepository.update(id, placa, modelo, marca, ano, cliente_id);
    if (!veiculoAtualizado) throw { status: 404, mensagem: 'Veículo não encontrado.' };

    return veiculoAtualizado;
  }

  async deletar(id) {
    const veiculoDeletado = await veiculoRepository.delete(id);
    if (!veiculoDeletado) throw { status: 404, mensagem: 'Veículo não encontrado.' };
    return veiculoDeletado;
  }
}

module.exports = new VeiculoService();