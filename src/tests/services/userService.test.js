/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const tokenGenerator = require('../../utils/tokenGenerator');
const userService = require('../../services/userService');
const dbQuery = require('../../database/dbQuery');


describe('UserService', () => {
  describe('#create(token)', () => {
    afterEach(async () => {
      await dbQuery.executeQuery('DELETE FROM users');
    });

    it('Should create new user', async () => {
      const token = tokenGenerator.generate();
      await userService.create(token);
      const result = await dbQuery.executeQuery('SELECT * FROM users WHERE application_token = $1::text', [token]);
      expect(result.rows[0]).to.exist;
    });
  });

  describe('#findByToken(token)', () => {
    const token = tokenGenerator.generate();

    before(async () => {
      await dbQuery.executeQuery('INSERT INTO users VALUES(1, $1::text)', [token]);
    });

    after(async () => {
      await dbQuery.executeQuery('DELETE FROM users');
    });

    it('Should return user by token', async () => {
      const user = await userService.findByToken(token);
      expect(user).to.exist;
      expect(user.application_token).to.be.equals(token);
    });
  });
});
