const router = require('../../utils/router');
const responder = require('../../utils/responder');
const checkToken = require('../../middlewares/checkToken');
const bodyParser = require('../../middlewares/bodyParser');
const testService = require('../../services/testService');
const userService = require('../../services/userService');
const validators = require('../../middlewares/validators/testRouter');

const HTTP_METHODS = require('../../consts/httpMethods');

router.register('/test', HTTP_METHODS.GET,
  checkToken,
  validators.validateGetTest,
  async (req, res) => {
    const test = await testService.findWithQuestionsByLink(req.link);
    if (!test) return responder.notFoundResponse(res, req.url);

    const { user } = req;
    const completedBeforeByCurrentUser = await userService.didPassTest(user.id, test.id);

    responder.okResponse(res, { test, completedBefore: completedBeforeByCurrentUser });
  });

router.register('/test', HTTP_METHODS.POST,
  bodyParser,
  validators.validatePostTest,
  async (req, res) => {
    const test = await testService.create(req.body);
    responder.okResponse(res, { link: test.link });
  });

router.register('/test/result', HTTP_METHODS.GET,
  validators.validateGetTestResult,
  async (req, res) => {
    const questionResult = await testService.getResultsOfQuestionById(req.testId, req.questionId);
    responder.okResponse(res, questionResult);
  });

router.register('/test/answer', HTTP_METHODS.POST,
  checkToken,
  bodyParser,
  validators.validatePostTestAnswer,
  async (req, res) => {
    const { answers } = req.body;

    await testService.saveAnswers(req.body.testId,
      req.user.id,
      req.body.userName,
      answers);
    responder.okResponse(res, {});
  });
