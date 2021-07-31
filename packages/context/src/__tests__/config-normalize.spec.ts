import { normalizeConfig } from '../config/normalize';

describe('configuration/normalize', () => {
  describe('#normalizeConfig', () => {
    test('.services', () => {
      expect(normalizeConfig({}).services).toEqual([]);
    });
  });
});
