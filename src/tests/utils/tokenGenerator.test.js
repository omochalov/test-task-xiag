const uuid = require('uuidv4');

const { expect } = require('chai');
const tokenGenerator = require('../../utils/tokenGenerator');

describe('TokenGenerator', () => {
  describe('#generate()', () => {
    it('Should return new token', () => {
      const token = tokenGenerator.generate();
      expect(token).to.be.a('string');
    });

    it('Token should be a uuidv4', () => {
      const token = tokenGenerator.generate();
      expect(uuid.is(token)).be.eql(true);
    });
  });
});
