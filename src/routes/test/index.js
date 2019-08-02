const url = require('url');

const router = require('../../utils/router');
const responder = require('../../utils/responder');
const checkToken = require('../../middlewares/checkToken');
const bodyParser = require('../../middlewares/bodyParser');
const testService = require('../../services/testService');
const userService = require('../../services/userService');

const HTTP_METHODS = require('../../consts/httpMethods');

router.register('/test', HTTP_METHODS.GET,
  checkToken,
  async (req, res) => {
    const parts = url.parse(req.url, true);
    const { link } = parts.query;

    if (!link) return responder.badResponse(res, { error: 'link must be in parameters' });

    const test = await testService.findWithQuestionsByLink(link);
    if (!test) return responder.notFoundResponse(res, req.url);

    const { user } = req;
    const didPastTest = await userService.didPassTest(user.id, test.id);

    responder.okResponse(res, { test, completedBefore: didPastTest });
  });

router.register('/test', HTTP_METHODS.POST,
  bodyParser,
  async (req, res) => {
    const test = await testService.create(req.body);
    responder.okResponse(res, { link: test.link });
  });

router.register('/test/result', HTTP_METHODS.GET,
  async (req, res) => {
    const parts = url.parse(req.url, true);
    const { testId, questionId } = parts.query;

    if (!testId || !questionId) return responder.badResponse(res, { error: 'testId and questionId must be in parameters' });

    const test = await testService.findById(testId);
    if (!test) return responder.badResponse(res, { error: `not found test with id: ${testId}` });

    const question = await testService.findQuestionById(questionId);
    if (!question) return responder.badResponse(res, { error: `not found question with id :${questionId}` });

    if (question.test_id !== testId) return responder.badResponse(res, { error: 'question from another test' });

    const questionResult = await testService.getResultsOfQuestionById(testId, questionId);
    responder.okResponse(res, questionResult);
  });

router.register('/test/answer', HTTP_METHODS.POST,
  checkToken,
  bodyParser,
  async (req, res) => {
    if (!req.body.testId) return responder.badResponse(res, { error: 'testId must be in body' });
    if (await userService.didPassTest(req.user.id, req.body.testId)) return responder.badResponse(res, { error: 'User passed this test before' });

    if (!req.body.userName) return responder.badResponse(res, { error: 'userName must be in body' });

    const test = await testService.findWithQuestionById(req.body.testId);
    if (!test) return responder.badResponse(res, { error: `not found test with id: ${req.body.testId}` });

    const { answers } = req.body;
    if (!answers) return responder.badResponse(res, { error: 'not found answers in body' });

    const { questions } = test;
    answers.forEach((answer) => {
      const { questionId, answerId } = answer;

      const question = questions[questionId];
      if (!question) return responder.badResponse(res, { error: `not found question with id ${questionId} in test` });

      if (!question.answers.map(a => a.id).includes(`${answerId}`)) {
        responder.badResponse(res, { error: `not found answer with id ${answerId} for question with id ${questionId}` });
      }
    });

    await testService.saveAnswers(req.body.testId,
      req.user.id,
      req.body.userName,
      answers);
    responder.okResponse(res, {});
  });
