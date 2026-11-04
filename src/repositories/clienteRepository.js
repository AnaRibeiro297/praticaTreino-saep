const db = require('../config/database');

class ClienteRepository {
  async findAll(busca) {
    let query = 'SELECT * FROM clientes';
    const params = [];

    if (busca) {
      query += ' WHERE nome ILIKE $1';
      params.push(`%${busca}%`);
    }

    const { rows } = await db.query(query, params);
    return rows;
  }

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM clientes WHERE id = $1', [id]);
    return rows[0];
  }

  async create(nome, cpf, email, telefone) {
    const query = `
      INSERT INTO clientes (nome, cpf, email, telefone) 
      VALUES ($1, $2, $3, $4) RETURNING *`;
    const { rows } = await db.query(query, [nome, cpf, email, telefone]);
    return rows[0];
  }

  async update(id, nome, cpf, email, telefone) {
    const query = `
      UPDATE clientes 
      SET nome = $1, cpf = $2, email = $3, telefone = $4 
      WHERE id = $5 RETURNING *`;
    const { rows } = await db.query(query, [nome, cpf, email, telefone, id]);
    return rows[0];
  }

  async delete(id) {
    const { rows } = await db.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  }
}

module.exports = new ClienteRepository();