const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      const result = await authService.login(email, senha);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro interno.' });
    }
  }
}

module.exports = new AuthController();