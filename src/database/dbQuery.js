const dbConfig = require('config').db;
const { Pool } = require('pg');

const pool = new Pool(dbConfig);

const executeQuery = (query, values) => {
  if (values) return pool.query(query, values);
  return pool.query(query);
};

module.exports = {
  executeQuery,
};
