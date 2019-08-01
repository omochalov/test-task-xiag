const parser = require('url');
const STATUS_CODES = require('../consts/statusCodes');
const CONTENT_TYPES = require('../consts/contentTypes');

const handlers = {};

const register = (url, method, callback) => {
  if (!handlers[url]) handlers[url] = {};
  handlers[url][method.toLowerCase()] = callback;
};

const notFound = (req, res) => {
  const url = parser.parse(req.url, true);
  res.writeHead(STATUS_CODES.NOT_FOUND, CONTENT_TYPES.JSON);
  res.end(JSON.stringify({ error: `Not found: ${url.pathname}` }));
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
