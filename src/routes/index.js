const router = require('../utils/router');
const responder = require('../utils/responder');

const HTTP_METHODS = require('../consts/httpMethods');

router.register('/', HTTP_METHODS.GET, (req, res) => {
  responder.okResponse(res, { hello: 'world' });
});
