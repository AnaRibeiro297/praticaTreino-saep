const db = require('../config/database');

class VeiculoRepository {
  async findAll() {
    const { rows } = await db.query('SELECT * FROM veiculos');
    return rows;
  }

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM veiculos WHERE id = $1', [id]);
    return rows[0];
  }

  async create(placa, modelo, marca, ano, cliente_id) {
    const query = `
      INSERT INTO veiculos (placa, modelo, marca, ano, cliente_id) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const { rows } = await db.query(query, [placa, modelo, marca, ano, cliente_id]);
    return rows[0];
  }

  async update(id, placa, modelo, marca, ano, cliente_id) {
    const query = `
      UPDATE veiculos 
      SET placa = $1, modelo = $2, marca = $3, ano = $4, cliente_id = $5 
      WHERE id = $6 RETURNING *`;
    const { rows } = await db.query(query, [placa, modelo, marca, ano, cliente_id, id]);
    return rows[0];
  }

  async delete(id) {
    const { rows } = await db.query('DELETE FROM veiculos WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  }
}

module.exports = new VeiculoRepository();