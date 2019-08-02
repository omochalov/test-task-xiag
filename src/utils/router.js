const parser = require('url');
const responder = require('../utils/responder');

let handlers = {};

const register = (url, method, ...callbacks) => {
  if (!handlers[url]) handlers[url] = {};
  handlers[url][method.toLowerCase()] = callbacks;
};

const getHandlers = () => handlers;

const clear = () => { handlers = {}; };

const notFound = (req, res) => {
  const url = parser.parse(req.url, true);
  responder.notFoundResponse(res, url);
};

const route = async (req, res) => {
  const url = parser.parse(req.url, true);
  const { method } = req;
  const handler = handlers[url.pathname] ? handlers[url.pathname][method.toLowerCase()] : null;
  if (!handler) return notFound(req, res);
  await handler.map(c => c(req, res));
};

module.exports = {
  register,
  getHandlers,
  clear,
  route,
};
