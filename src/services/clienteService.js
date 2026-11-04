const clienteRepository = require('../repositories/clienteRepository');
const { encrypt, decrypt } = require('../utils/crypto');

class ClienteService {
  async listar(busca) {
    const clientes = await clienteRepository.findAll(busca);
    return clientes.map(cliente => ({
      ...cliente,
      cpf: decrypt(cliente.cpf) // Descriptografa antes de enviar
    }));
  }

  async criar({ nome, cpf, email, telefone }) {
    const cpfCriptografado = encrypt(cpf);
    const novoCliente = await clienteRepository.create(nome, cpfCriptografado, email, telefone);
    return {
      ...novoCliente,
      cpf: decrypt(novoCliente.cpf)
    };
  }

  async atualizar(id, { nome, cpf, email, telefone }) {
    const cpfCriptografado = encrypt(cpf);
    const clienteAtualizado = await clienteRepository.update(id, nome, cpfCriptografado, email, telefone);
    if (!clienteAtualizado) throw { status: 404, mensagem: 'Cliente não encontrado.' };
    
    return {
      ...clienteAtualizado,
      cpf: decrypt(clienteAtualizado.cpf)
    };
  }

  async deletar(id) {
    const clienteDeletado = await clienteRepository.delete(id);
    if (!clienteDeletado) throw { status: 404, mensagem: 'Cliente não encontrado.' };
    return clienteDeletado;
  }
}

module.exports = new ClienteService();