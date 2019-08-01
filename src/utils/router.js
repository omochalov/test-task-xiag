const parser = require('url');
const responder = require('../utils/responder');

const handlers = {};

const register = (url, method, callback) => {
  if (!handlers[url]) handlers[url] = {};
  handlers[url][method.toLowerCase()] = callback;
};

const notFound = (req, res) => {
  const url = parser.parse(req.url, true);
  responder.notFoundResponse(res, url);
};

const route = (req, res) => {
  const url = parser.parse(req.url, true);
  const { method } = req;
  const handler = handlers[url.pathname] ? handlers[url.pathname][method.toLowerCase()] : null;
  if (!handler) return notFound(req, res);
  return handler(req, res);
};

module.exports = {
  register,
  route,
  notFound,
};
