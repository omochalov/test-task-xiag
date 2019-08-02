const responder = require('../utils/responder');

const bodyParser = async (req, res) => new Promise((resolve, reject) => {
  let body = '';

  req.on('data', (data) => {
    body += data;

    if (body.length > 1e6) req.connection.destroy();
    responder.badResponse(res, { error: 'Too long data' });
    reject();
  });

  req.on('end', () => {
    req.body = JSON.parse(body);
    resolve();
  });
});

module.exports = bodyParser;
