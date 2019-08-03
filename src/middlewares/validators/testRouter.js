const url = require('url');
const responder = require('../../utils/responder');
const testService = require('../../services/testService');
const userService = require('../../services/userService');

const validateGetTest = async (req, res) => {
  const parts = url.parse(req.url, true);
  const { link } = parts.query;

  if (!link) return responder.badResponse(res, { error: 'link must be in parameters' });
  req.link = link;
};

const validatePostTest = async (req, res) => {
  const testData = req.body;

  if (Object.keys(testData).length === 0) return responder.badResponse(res, { error: 'no questions provided' });

  for (const question in testData) {
    if (!{}.hasOwnProperty.call(question, testData)) continue;

    if (!Array.isArray(testData.question) || testData.some(elem => typeof elem !== 'string')) {
      return responder.badResponse(res, { error: 'incorrect format of request' });
    }
  }
};

const validateGetTestResult = async (req, res) => {
  const parts = url.parse(req.url, true);
  const { testId, questionId } = parts.query;

  if (!testId || !questionId) {
    return responder.badResponse(res, { error: 'testId and questionId must be in parameters' });
  }

  const test = await testService.findById(testId);
  if (!test) return responder.badResponse(res, { error: `not found test with id: ${testId}` });

  const question = await testService.findQuestionById(questionId);
  if (!question) return responder.badResponse(res, { error: `not found question with id :${questionId}` });

  if (question.test_id !== testId) return responder.badResponse(res, { error: 'question from another test' });

  req.testId = testId;
  req.questionId = questionId;
};

const validatePostTestAnswer = async (req, res) => {
  if (!req.body.testId) return responder.badResponse(res, { error: 'testId must be in body' });

  if (await userService.didPassTest(req.user.id, req.body.testId)) {
    return responder.badResponse(res, { error: 'User passed this test before' });
  }

  if (!req.body.userName) return responder.badResponse(res, { error: 'userName must be in body' });

  const test = await testService.findWithQuestionById(req.body.testId);
  if (!test) return responder.badResponse(res, { error: `not found test with id: ${req.body.testId}` });

  const { answers } = req.body;
  if (!answers) return responder.badResponse(res, { error: 'not found answers in body' });

  const { questions } = test;
  answers.forEach((answer) => {
    const { questionId, answerId } = answer;

    const question = questions[questionId];
    if (!question) {
      return responder.badResponse(res, { error: `not found question with id ${questionId} in test` });
    }

    if (!question.answers.map(a => a.id).includes(`${answerId}`)) {
      return responder.badResponse(res,
        { error: `not found answer with id ${answerId} for question with id ${questionId}` });
    }
  });
};

module.exports = {
  validateGetTest,
  validatePostTest,
  validateGetTestResult,
  validatePostTestAnswer,
};
