/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const randomstring = require('randomstring');
const testService = require('../../services/testService');
const dbQuery = require('../../database/dbQuery');
const linkGenerator = require('../../utils/linkGenerator');
const tokenGenerator = require('../../utils/tokenGenerator');

describe('TestService', () => {
  describe('#create()', () => {
    afterEach(async () => {
      await dbQuery.executeQuery('DELETE FROM tests');
    });

    it('Should create new test', async () => {
      await testService.create({ question1: ['answer1', 'answer2'] });

      let result = await dbQuery.executeQuery('SELECT * FROM tests');
      expect(result.rows[0]).to.exist;

      result = await dbQuery.executeQuery('SELECT * FROM questions');
      expect(result.rows[0]).to.exist;

      result = await dbQuery.executeQuery('SELECT * FROM possible_answers');
      expect(result.rows.length).to.be.equals(2);
    });
  });

  describe('#findWithQuestionsByLink', () => {
    const link = linkGenerator.generate();
    const questionText = randomstring.generate();
    const firstAnswerText = randomstring.generate();
    const secondAnswerText = randomstring.generate();

    before(async () => {
      await dbQuery.executeQuery('INSERT INTO tests VALUES(1, $1::text)', [link]);
      await dbQuery.executeQuery('INSERT INTO questions VALUES(1, 1, $1::text)', [questionText]);
      await dbQuery.executeQuery('INSERT INTO possible_answers VALUES(1, 1, $1::text)', [firstAnswerText]);
      await dbQuery.executeQuery('INSERT INTO possible_answers VALUES(2, 1, $1::text)', [secondAnswerText]);
    });

    after(async () => {
      await dbQuery.executeQuery('DELETE FROM tests');
    });

    it('Should return test with questions', async () => {
      const test = await testService.findWithQuestionsByLink(link);

      const expected = {
        testId: '1',
        questions: {
          1: {
            text: questionText,
            answers: [{ id: '1', text: firstAnswerText },
              { id: '2', text: secondAnswerText }],
          },
        },
      };
      expect(test).to.be.deep.equal(expected);
    });

    it('Should return null for incorrect link', async () => {
      const link = randomstring.generate();
      const test = await testService.findWithQuestionsByLink(link);

      expect(test).to.be.equals(null);
    });
  });

  describe('#findByLink(link)', () => {
    const link = linkGenerator.generate();

    before(async () => {
      await dbQuery.executeQuery('INSERT INTO tests VALUES(1, $1::text)', [link]);
    });

    after(async () => {
      await dbQuery.executeQuery('DELETE FROM tests');
    });

    it('Should return user by token', async () => {
      const test = await testService.findByLink(link);
      expect(test).to.exist;
      expect(test.link).to.be.equals(link);
    });
  });

  describe('#getResultsOfQuestionById', () => {
    const link = linkGenerator.generate();
    const questionText = randomstring.generate();
    const firstAnswerText = randomstring.generate();
    const secondAnswerText = randomstring.generate();

    const userToken = tokenGenerator.generate();
    const userName = randomstring.generate();

    before(async () => {
      await dbQuery.executeQuery('INSERT INTO tests VALUES(1, $1::text)', [link]);

      await dbQuery.executeQuery('INSERT INTO questions VALUES(1, 1, $1::text)', [questionText]);

      await dbQuery.executeQuery('INSERT INTO possible_answers VALUES(1, 1, $1::text)', [firstAnswerText]);
      await dbQuery.executeQuery('INSERT INTO possible_answers VALUES(2, 1, $1::text)', [secondAnswerText]);

      await dbQuery.executeQuery('INSERT INTO users VALUES(1, $1::text)', [userToken]);

      await dbQuery.executeQuery('INSERT INTO user_names_to_tests VALUES(1, 1, $1::text)', [userName]);

      await dbQuery.executeQuery('INSERT INTO user_answers VALUES(1, 1, 1, 1)');
    });

    after(async () => {
      await dbQuery.executeQuery('DELETE FROM tests');
      await dbQuery.executeQuery('DELETE FROM users');
    });

    it('Should return test\'s results', async () => {
      const testResults = await testService.getResultsOfQuestionById(1, 1);
      const expectedAnswer = {
        questionId: 1,
        question: questionText,
        possibleAnswers: [
          {
            id: '1',
            text: firstAnswerText,
          },
          {
            id: '2',
            text: secondAnswerText,
          },
        ],
        answers: [
          {
            userId: '1',
            userName,
            answerId: '1',
          },
        ],
      };

      expect(JSON.stringify(testResults)).to.be.equals(JSON.stringify(expectedAnswer));
    });
  });

  describe('#saveAnswers', () => {
    const link = linkGenerator.generate();
    const questionText = randomstring.generate();
    const firstAnswerText = randomstring.generate();
    const secondAnswerText = randomstring.generate();

    const userToken = tokenGenerator.generate();
    const userName = randomstring.generate();

    before(async () => {
      await dbQuery.executeQuery('INSERT INTO tests VALUES(1, $1::text)', [link]);

      await dbQuery.executeQuery('INSERT INTO questions VALUES(1, 1, $1::text)', [questionText]);

      await dbQuery.executeQuery('INSERT INTO possible_answers VALUES(1, 1, $1::text)', [firstAnswerText]);
      await dbQuery.executeQuery('INSERT INTO possible_answers VALUES(2, 1, $1::text)', [secondAnswerText]);

      await dbQuery.executeQuery('INSERT INTO users VALUES(1, $1::text)', [userToken]);
    });

    after(async () => {
      await dbQuery.executeQuery('DELETE FROM tests');
      await dbQuery.executeQuery('DELETE FROM users');
    });

    it('Should save user\'s answers', async () => {
      await testService.saveAnswers(1, 1, userName, [{
        questionId: 1,
        answerId: 2,
      }]);

      const nameToTest = await dbQuery.executeQuery('SELECT * FROM user_names_to_tests WHERE name = $1::text AND test_id = 1', [userName]);
      expect(nameToTest).to.exist;

      const answer = await dbQuery.executeQuery('SELECT * FROM user_answers WHERE answer_id = 2 AND question_id = 1');
      expect(answer).to.exist;
    });
  });
});
