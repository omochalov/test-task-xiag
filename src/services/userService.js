const dbQuery = require('../database/dbQuery');

const create = token => dbQuery.executeQuery('INSERT INTO users VALUES (DEFAULT, $1::text)', [token]);

const findByToken = async (token) => {
  const result = await dbQuery.executeQuery('SELECT * FROM users WHERE application_token = $1::text', [token]);
  return result.rows[0] ? result.rows[0] : null;
};

module.exports = {
  create,
  findByToken,
};
