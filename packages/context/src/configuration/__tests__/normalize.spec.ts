import { normalizeConfig } from '../normalize';

describe('configuration/normalize', () => {
  describe('#normalizeConfig', () => {
    test('.services', () => {
      expect(normalizeConfig({}).services).toEqual([]);
    });
    test('.operatorToken', () => {
      expect(normalizeConfig({})?.operatorToken.length).toBeGreaterThan(31);
    });
    test('.jwt.secret', () => {
      expect(normalizeConfig({})?.jwt?.secret?.length).toEqual(32);
    });
  });
});
