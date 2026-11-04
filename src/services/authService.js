const usuarioRepository = require('../repositories/usuarioRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/auth');

class AuthService {
  async login(email, senha) {
    const usuario = await usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw { status: 401, mensagem: 'Credenciais inválidas.' };
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      throw { status: 401, mensagem: 'Credenciais inválidas.' };
    }

    // Geração do token com expiração de 1 hora
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });

    return { token, nome: usuario.nome };
  }
}

module.exports = new AuthService();