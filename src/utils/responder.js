const STATUS_CODES = require('../consts/statusCodes');
const CONTENT_TYPES = require('../consts/contentTypes');

const baseJsonResponse = (res, obj) => {
  if (typeof obj === 'string') return res.end(obj);
  return res.end(JSON.stringify(obj));
};

const notFoundResponse = (res, url) => {
  res.writeHead(STATUS_CODES.NOT_FOUND, CONTENT_TYPES.JSON);
  res.end(JSON.stringify({ error: `Not found: ${url.pathname}` }));
};

const okResponse = (res, obj) => {
  res.writeHead(STATUS_CODES.OK, CONTENT_TYPES.JSON);
  return baseJsonResponse(res, obj);
};

module.exports = {
  notFoundResponse,
  okResponse,
};