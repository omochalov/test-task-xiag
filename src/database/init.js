const dbConfig = require('config').db;
const logger = require('js-logger');
const dbQuery = require('./dbQuery');

logger.useDefaults();

const init = async () => {
  try {
    logger.info('Let\'s try to drop old database and user...');
    await dbQuery.executeQuery(`DROP DATABASE "${dbConfig.createdDatabaseName}"`);
    await dbQuery.executeQuery(`DROP USER IF EXISTS ${dbConfig.createdUserName}`);
    logger.info('Success.');
  } catch (err) {
    logger.error(`An error occurred while dropping database or user: ${err}`);
  }

  try {
    logger.info('Create user and database...');
    await dbQuery.executeQuery(`CREATE DATABASE "${dbConfig.createdDatabaseName}"`);
    await dbQuery.executeQuery(`CREATE USER ${dbConfig.createdUserName} WITH ENCRYPTED PASSWORD 'test'`);
    await dbQuery.executeQuery(`GRANT ALL PRIVILEGES ON DATABASE ${dbConfig.createdDatabaseName} to ${dbConfig.createdUserName}`);
    return logger.info('User and database created');
  } catch (err) {
    logger.error(`An error occurred while creating database or user: ${err}`);
  }
};

init().then().catch();
