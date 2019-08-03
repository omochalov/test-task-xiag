/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const randomstring = require('randomstring');
require('../../bin/www');
const dbQuery = require('../../database/dbQuery');
const tokenGenerator = require('../../utils/tokenGenerator');
const linkGenerator = require('../../utils/linkGenerator');

chai.use(chaiHttp);


describe('Tests router', () => {
  describe('#GET test/', async () => {
    const userToken = tokenGenerator.generate();

    const testLink = linkGenerator.generate();
    const questionText = randomstring.generate();
    const firstAnswerText = randomstring.generate();
    const secondAnswerText = randomstring.generate();

    before(async () => {
      await dbQuery.executeQuery('INSERT INTO users VALUES(1, $1::text)', [userToken]);

      await dbQuery.executeQuery('INSERT INTO tests VALUES(1, $1::text)', [testLink]);

      await dbQuery.executeQuery('INSERT INTO questions VALUES(1, 1, $1::text)', [questionText]);

      await dbQuery.executeQuery('INSERT INTO possible_answers VALUES(1, 1, $1::text)', [firstAnswerText]);
      await dbQuery.executeQuery('INSERT INTO possible_answers VALUES(2, 1, $1::text)', [secondAnswerText]);
    });

    after(async () => {
      await dbQuery.executeQuery('DELETE FROM users');
      await dbQuery.executeQuery('DELETE FROM tests');
    });

    it('Should return test questions and user\'s complete status', async () => {
      const res = await chai.request('http://localhost:3000')
        .get('/test')
        .set('token', userToken)
        .query({ link: testLink });
      expect(res.statusCode).to.be.equals(200);
      const content = JSON.parse(res.text);

      const expected = {
        test: {
          testId: '1',
          questions: {
            1: {
              text: questionText,
              answers: [
                {
                  id: '1',
                  text: firstAnswerText,
                },
                {
                  id: '2',
                  text: secondAnswerText,
                },
              ],
            },
          },
        },
        completedBefore: false,
      };

      expect(JSON.stringify(content)).to.be.equals(JSON.stringify(expected));
    });

    it('Should reject when token not set', async () => {
      const res = await chai.request('http://localhost:3000')
        .get('/test')
        .query({ link: testLink });
      expect(res.statusCode).to.be.equals(400);
    });

    it('Should reject when token is incorrect', async () => {
      const res = await chai.request('http://localhost:3000')
        .get('/test')
        .set('token', randomstring.generate())
        .query({ link: testLink });
      expect(res.statusCode).to.be.equals(400);
    });

    it('Should reject when link is not provided', async () => {
      const res = await chai.request('http://localhost:3000')
        .get('/test')
        .set('token', userToken);
      expect(res.statusCode).to.be.equals(400);
    });

    it('Should return 404 when link is incorrect', async () => {
      const res = await chai.request('http://localhost:3000')
        .get('/test')
        .set('token', userToken)
        .query({ link: randomstring.generate() });
      expect(res.statusCode).to.be.equals(404);
    });
  });

  describe('#POST test/', async () => {
    after(async () => {
      await dbQuery.executeQuery('DELETE FROM tests');
    });

    it('Should create new test', async () => {
      const questionName = randomstring.generate();
      const firstAnswer = randomstring.generate();
      const secondAnswer = randomstring.generate();

      const sendData = {};
      sendData[questionName] = [firstAnswer, secondAnswer];

      const res = await chai.request('http://localhost:3000')
        .post('/test')
        .set('Content-Type', 'application/json')
        .send(sendData);
      expect(res.statusCode).to.be.equals(200);

      const test = (await dbQuery.executeQuery('SELECT * FROM tests')).rows[0];
      expect(test).to.exist;

      const question = (await dbQuery.executeQuery('SELECT * FROM questions')).rows[0];
      expect(question).to.exist;
      expect(question.test_id).to.be.equals(test.id);
      expect(question.text).to.be.equals(questionName);

      const answers = (await dbQuery.executeQuery('SELECT * FROM possible_answers')).rows;
      expect(answers.length).to.be.equals(2);
    });

    it('Should reject when questions not provided', async () => {
      const res = await chai.request('http://localhost:3000')
        .post('/test')
        .set('Content-Type', 'application/json')
        .send({});
      expect(res.statusCode).to.be.equals(400);
    });

    it('Should reject when questions has incorrect format', async () => {
      const res = await chai.request('http://localhost:3000')
        .get('/test')
        .set('token', randomstring.generate())
        .query({ question: { a: 1, b: 2 } });
      expect(res.statusCode).to.be.equals(400);
    });
  });

  describe('#GET /test/resuls', async () => {
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

    it('Should return test results', async () => {
      const res = await chai.request('http://localhost:3000')
        .get('/test/result')
        .query({ testId: 1, questionId: 1 });

      expect(res.statusCode).to.be.equals(200);
      const content = JSON.parse(res.text);

      const expected = {
        questionId: '1',
        question: questionText,
        possibleAnswers:
          [{ id: '1', text: firstAnswerText },
            { id: '2', text: secondAnswerText }],
        answers:
          [{
            userId: '1',
            userName,
            answerId: '1',
          }],
      };
      expect(JSON.stringify(content)).to.be.equals(JSON.stringify(expected));
    });

    it('Should reject when testId is not provided', async () => {
      const res = await chai.request('http://localhost:3000')
        .get('/test/result')
        .query({ questionId: 1 });
      expect(res.statusCode).to.be.equals(400);
    });

    it('Should reject when questionId is not provided', async () => {
      const res = await chai.request('http://localhost:3000')
        .get('/test/result')
        .query({ testId: 1 });
      expect(res.statusCode).to.be.equals(400);
    });
  });

  describe('#POST /test/answer', async () => {
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

    it('Should save test\'s answers', async () => {
      const res = await chai.request('http://localhost:3000')
        .post('/test/answer')
        .set('token', userToken)
        .send({ testId: 1, userName, answers: [{ questionId: 1, answerId: 2 }] });

      expect(res.statusCode).to.be.equals(200);

      const nameToTest = await dbQuery.executeQuery('SELECT * FROM user_names_to_tests WHERE name = $1::text AND test_id = 1', [userName]);
      expect(nameToTest).to.exist;

      const answer = await dbQuery.executeQuery('SELECT * FROM user_answers WHERE answer_id = 2 AND question_id = 1');
      expect(answer).to.exist;
    });

    it('Should reject when token is not set', async () => {
      const res = await chai.request('http://localhost:3000')
        .post('/test/answer')
        .send({ testId: 1, userName, answers: [{ questionId: 1, answerId: 2 }] });
      expect(res.statusCode).to.be.equals(400);
    });

    it('Should reject when testId is not provided', async () => {
      const res = await chai.request('http://localhost:3000')
        .post('/test/answer')
        .set('token', userToken)
        .send({ userName, answers: [{ questionId: 1, answerId: 2 }] });
      expect(res.statusCode).to.be.equals(400);
    });

    it('Should reject when userName is not provided', async () => {
      const res = await chai.request('http://localhost:3000')
        .post('/test/answer')
        .set('token', userToken)
        .send({ testId: 1, answers: [{ questionId: 1, answerId: 2 }] });
      expect(res.statusCode).to.be.equals(400);
    });

    it('Should reject when answerId-questionId pain is incorrect', async () => {
      const res = await chai.request('http://localhost:3000')
        .post('/test/answer')
        .set('token', userToken)
        .send({ testId: 1, userName, answers: [{ questionId: 50, answerId: 2 }] });
      expect(res.statusCode).to.be.equals(400);
    });
  });
});
