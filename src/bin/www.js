const serverConfig = require('config').server;
const http = require('http');
const Logger = require('js-logger');
const router = require('../utils/router');

const { port } = serverConfig;

Logger.useDefaults();

// require routes
require('require-all')({
  dirname: `${__dirname}/../routes`,
  recursive: true,
});

const server = http.createServer((req, res) => {
  router.route(req, res);
});

server.listen(port, (err) => {
  if (err) return Logger.error('something bad happened', err);
  Logger.info(`server is listening on ${port}`);
});
