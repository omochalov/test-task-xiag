/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const testService = require('../../services/testService');
const dbQuery = require('../../database/dbQuery');
const linkGenerator = require('../../utils/linkGenerator');

describe('TestService', () => {
  describe('#create()', () => {
    afterEach(async () => {
      await dbQuery.executeQuery('DELETE FROM tests');
    });

    it('Should create new test', async () => {
      await testService.create();
      const result = await dbQuery.executeQuery('SELECT * FROM tests');
      expect(result.rows[0]).to.exist;
    });
  });

  describe('#findByLink(link)', () => {
    const link = linkGenerator.generate();

    before(async () => {
      await dbQuery.executeQuery('INSERT INTO tests VALUES(1, $1::text)', [link]);
    });

    after(async () => {
      await dbQuery.executeQuery('DELETE FROM tests');
    });

    it('Should return user by token', async () => {
      const test = await testService.findByLink(link);
      expect(test).to.exist;
      expect(test.link).to.be.equals(link);
    });
  });
});
