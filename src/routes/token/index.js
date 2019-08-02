const router = require('../../utils/router');
const responder = require('../../utils/responder');
const tokenGenerator = require('../../utils/tokenGenerator');
const userService = require('../../services/userService');

const HTTP_METHODS = require('../../consts/httpMethods');

router.register('/token', HTTP_METHODS.GET, async (req, res) => {
  const token = tokenGenerator.generate();
  await userService.create(token);
  responder.okResponse(res, { token });
});
