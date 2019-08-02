const responder = require('../utils/responder');

const checkToken = (req, res) => {
  const { token } = req.headers;
  if (!token) return responder.badRequest(res, { error: 'token must be in headers' });
  req.token = token;
};

module.exports = checkToken;
