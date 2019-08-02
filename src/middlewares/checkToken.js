const responder = require('../utils/responder');
const userService = require('../services/userService');

const checkToken = async (req, res) => {
  const { token } = req.headers;
  if (!token) return responder.badResponse(res, { error: 'token must be in headers' });

  const user = await userService.findByToken(token);
  if (!user) return responder.badResponse(res, { error: 'incorrect token' });

  req.token = token;
  req.user = user;
};

module.exports = checkToken;
