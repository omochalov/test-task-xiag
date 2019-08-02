const dbQuery = require('../database/dbQuery');

const findByToken = async (token) => {
  const result = await dbQuery.executeQuery('SELECT * FROM users WHERE application_token = $1::text', [token]);
  return result.rows[0] ? result.rows[0] : null;
};

const create = async (token) => {
  await dbQuery.executeQuery('INSERT INTO users VALUES (DEFAULT, $1::text)', [token]);
  return findByToken(token);
};

module.exports = {
  create,
  findByToken,
};
