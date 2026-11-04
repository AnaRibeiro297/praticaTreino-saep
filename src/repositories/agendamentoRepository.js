const db = require('../config/database');

class AgendamentoRepository {
  async findAllWithRelations() {
    const query = `
      SELECT 
        a.id AS agendamento_id,
        a.data_agendamento,
        a.descricao,
        v.id AS veiculo_id,
        v.placa,
        v.modelo,
        c.id AS cliente_id,
        c.nome AS cliente_nome,
        c.cpf AS cliente_cpf
      FROM agendamentos a
      JOIN veiculos v ON a.veiculo_id = v.id
      JOIN clientes c ON v.cliente_id = c.id
      ORDER BY a.data_agendamento ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  async create(data_agendamento, descricao, veiculo_id) {
    const query = `
      INSERT INTO agendamentos (data_agendamento, descricao, veiculo_id) 
      VALUES ($1, $2, $3) RETURNING *`;
    const { rows } = await db.query(query, [data_agendamento, descricao, veiculo_id]);
    return rows[0];
  }

  async updateDate(id, data_agendamento) {
    const query = `
      UPDATE agendamentos 
      SET data_agendamento = $1 
      WHERE id = $2 RETURNING *`;
    const { rows } = await db.query(query, [data_agendamento, id]);
    return rows[0];
  }

  async delete(id) {
    const { rows } = await db.query('DELETE FROM agendamentos WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  }
}

module.exports = new AgendamentoRepository();