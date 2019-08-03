const { expect } = require('chai');
const sinon = require('sinon');
const router = require('../../utils/router');

describe('Router', () => {
  describe('#register()', () => {
    beforeEach(() => {
      router.clear();
    });

    afterEach(() => {
      router.clear();
    });

    it('Should register new callback', () => {
      const callback = () => {};
      router.register('/', 'POST', callback);
      expect(router.getHandlers()).to.be.deep.equal({ '/': { post: [callback] } });
    });
  });

  describe('#route()', async () => {
    afterEach(() => {
      router.clear();
    });

    it('Should call correct handler', () => {
      const testAnswer = 'test';
      const callback = (req, res) => { res.a = testAnswer; };
      router.register('/', 'get', callback);

      const req = { url: '/', method: 'GET' };
      const res = {};

      router.route(req, res);
      expect(res.a).to.be.equals(testAnswer);
    });

    it('Should set 404 status code and return error for undefined route', () => {
      const req = { url: '/undefined-route', method: 'undefined-method' };
      // sorry, no time for correct stubbing
      const res = { writeHead: sinon.spy(), end: sinon.spy() };
      router.route(req, res);
      expect(res.writeHead.args[0][0]).to.be.equals(404);
      expect(res.writeHead.args[0][1]).to.be.deep.equals({ 'Content-Type': 'application/json' });
      expect(res.end.args[0][0]).to.be.equals(JSON.stringify({ error: 'Not found: /undefined-route' }));
    });
  });
});
