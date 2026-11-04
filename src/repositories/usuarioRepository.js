const db = require('../config/database');

class UsuarioRepository {
  async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }
}

module.exports = new UsuarioRepository();