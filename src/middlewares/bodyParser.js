const bodyParser = async (req, res, next) => {
  let body = '';

  req.on('data', (data) => {
    body += data;

    if (body.length > 1e6) req.connection.destroy();
  });

  req.on('end', () => {
    req.body = JSON.parse(body);
    next(req, res);
  });
};

module.exports = bodyParser;
