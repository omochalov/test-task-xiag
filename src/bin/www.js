const serverConfig = require('config').server;
const http = require('http');
const Logger = require('js-logger');

const { port } = serverConfig;

Logger.useDefaults();

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ hello: 'world' }));
});

server.listen(port, (err) => {
  if (err) return Logger.error('something bad happened', err);
  Logger.info(`server is listening on ${port}`);
});
