const logger = require('js-logger');
const dbQuery = require('./dbQuery');

logger.useDefaults();

const init = async () => {
  try {
    logger.info('Create user and database...');
    await dbQuery.executeQuery('CREATE DATABASE "app"');
    await dbQuery.executeQuery('CREATE USER dbuser WITH ENCRYPTED PASSWORD \'test\'');
    await dbQuery.executeQuery('GRANT ALL PRIVILEGES ON DATABASE "app" to dbuser');
    return logger.info('User and database created');
  } catch (err) {
    return logger.error(`An error occurred while creating database or user: ${err}`);
  }
};

init().then().catch();
