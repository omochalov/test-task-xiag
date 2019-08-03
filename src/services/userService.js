const dbQuery = require('../database/dbQuery');

const findByToken = async (token) => {
  const result = await dbQuery.executeQuery('SELECT * FROM users WHERE application_token = $1::text',
    [token]);
  return result.rows[0] ? result.rows[0] : null;
};

const create = async (token) => {
  await dbQuery.executeQuery('INSERT INTO users VALUES (DEFAULT, $1::text)', [token]);
  return findByToken(token);
};

const didPassTest = async (userId, testId) => {
  const result = await dbQuery
    .executeQuery('SELECT * FROM user_names_to_tests WHERE user_id = $1::bigint AND test_id = $2::bigint',
      [userId, testId]);
  return !!result.rows.length;
};

module.exports = {
  create,
  findByToken,
  didPassTest,
};
