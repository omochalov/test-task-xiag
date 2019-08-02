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
  (req, res) => {
    bodyParser(req, res, async (req, res) => {
      const test = await testService.create(req.body);
      responder.okResponse(res, { link: test.link });
    });
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
