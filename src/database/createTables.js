const logger = require('js-logger');
const dbQuery = require('./dbQuery');

logger.useDefaults();

const createTables = async () => {
  try {
    logger.info('Let\'s try to drop old tables...');
    await dbQuery.executeQuery('DROP TABLE IF EXISTS users;');
    await dbQuery.executeQuery('DROP TABLE IF EXISTS tests;');
    logger.info('Success.');
  } catch (err) {
    return logger.error(`An error occurred while dropping tables: ${err}`);
  }

  try {
    logger.info('Create tables...');

    await dbQuery.executeQuery(`CREATE TABLE tests (id BIGSERIAL NOT NULL, 
                                              link VARCHAR(255),
                                              PRIMARY KEY (ID))`);

    await dbQuery.executeQuery(`CREATE TABLE questions (id BIGSERIAL NOT NULL,
                                              test_id BIGSERIAL REFERENCES tests(id) ON DELETE CASCADE,
                                              text VARCHAR(255),
                                              PRIMARY KEY (ID))`);

    await dbQuery.executeQuery(`CREATE TABLE possible_answers (id BIGSERIAL NOT NULL,
                                              question_id BIGSERIAL REFERENCES questions(id) ON DELETE CASCADE,
                                              text VARCHAR(255),
                                              PRIMARY KEY (ID))`);

    await dbQuery.executeQuery(`CREATE TABLE users (id BIGSERIAL NOT NULL,
                                              application_token VARCHAR(255),
                                              PRIMARY KEY (ID))`);

    await dbQuery.executeQuery(`CREATE TABLE user_answers (id BIGSERIAL NOT NULL,
                                              question_id BIGSERIAL REFERENCES questions(id) ON DELETE CASCADE,
                                              answer_id BIGSERIAL REFERENCES possible_answers(id) ON DELETE CASCADE,
                                              user_id BIGSERIAL REFERENCES users(id) ON DELETE CASCADE,
                                              PRIMARY KEY (ID))`);

    return logger.info('Tables created');
  } catch (err) {
    return logger.error(`An error occurred while creating tables: ${err}`);
  }
};

createTables().then().catch();
