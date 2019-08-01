const serverConfig = require('config').server;
const http = require('http');
const Logger = require('js-logger');
const router = require('../utils/router');

const HTTP_METHODS = require('../consts/httpMethods');
const STATUS_CODES = require('../consts/statusCodes');
const CONTENT_TYPES = require('../consts/contentTypes');

const { port } = serverConfig;

Logger.useDefaults();

router.register('/', HTTP_METHODS.GET, (req, res) => {
  res.writeHead(STATUS_CODES.OK, CONTENT_TYPES.JSON);
  res.end(JSON.stringify({ hello: 'world' }));
});

const server = http.createServer((req, res) => {
  router.route(req, res);
});

server.listen(port, (err) => {
  if (err) return Logger.error('something bad happened', err);
  Logger.info(`server is listening on ${port}`);
});
