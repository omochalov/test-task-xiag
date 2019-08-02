/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../bin/www');
const userService = require('../../services/userService');
const router = require('../../utils/router');
const dbQuery = require('../../database/dbQuery');

chai.use(chaiHttp);


describe('Tokens router', () => {
  after(async () => {
    await dbQuery.executeQuery('DELETE FROM users');
    router.clear();
    server.stop();
  });

  describe('#GET ()', async () => {
    it('Should return new token and create user in db', async () => {
      const res = await chai.request('http://localhost:3000').get('/token');
      expect(res.statusCode).to.be.equals(200);

      const content = JSON.parse(res.text);
      expect(content.token).to.exist;

      const user = await userService.findByToken(content.token);
      expect(user).to.exist;
    });
  });
});
