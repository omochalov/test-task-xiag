const dbQuery = require('../database/dbQuery');
const uuid = require('uuidv4');

const findByLink = async (link) => {
  const result = await dbQuery.executeQuery('SELECT * FROM tests WHERE link = $1::text', [link]);
  return result.rows[0] ? result.rows[0] : null;
};

const create = async () => {
  const link = uuid();
  await dbQuery.executeQuery('INSERT INTO tests VALUES (DEFAULT, $1::text)', [link]);
  return findByLink(link);
};

module.exports = {
  create,
  findByLink,
};
