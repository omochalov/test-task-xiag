const STATUS_CODES = require('../consts/statusCodes');
const CONTENT_TYPES = require('../consts/contentTypes');

const baseJsonResponse = (res, obj) => {
  if (typeof obj === 'string') return res.end(obj);
  return res.end(JSON.stringify(obj));
};

const notFoundResponse = (res, url) => {
  res.writeHead(STATUS_CODES.NOT_FOUND, CONTENT_TYPES.JSON);
  res.needContinue = false;
  return baseJsonResponse(res, { error: `Not found: ${url.pathname}` });
};

const badResponse = (res, obj) => {
  res.writeHead(STATUS_CODES.BAD, CONTENT_TYPES.JSON);
  res.needContinue = false;
  return baseJsonResponse(res, obj);
};

const okResponse = (res, obj) => {
  res.writeHead(STATUS_CODES.OK, CONTENT_TYPES.JSON);
  res.needContinue = true;
  return baseJsonResponse(res, obj);
};

const unhandledErrorResponse = (res) => {
  res.writeHead(STATUS_CODES.UNRESOLVED_ERROR, CONTENT_TYPES.JSON);
  res.needContinue = false;
  return baseJsonResponse(res, { error: 'unexpected error' });
};

module.exports = {
  notFoundResponse,
  okResponse,
  badResponse,
  unhandledErrorResponse,
};
