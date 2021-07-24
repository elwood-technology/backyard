import { join } from 'path';

import { createContext } from '../create';
import {
  createDevCoreServiceSettings,
  createBuildCoreServiceSettings,
} from '../mode';
import { coreServices } from '../services';
import helper from './helpers';

describe('create', () => {
  beforeEach(helper.setCleanTestCwd);
  afterEach(helper.switchBackToCorrectCwd);

  describe('#createContext', () => {
    test('should fail if cwd does not exist', async () => {
      const cwd = Math.random().toString();
      await expect(
        createContext({
          mode: 'dev',
          cwd,
        }),
      ).rejects.toThrow('Current working directory');
    });

    test('should fail if root does not exist', async () => {
      const cwd = Math.random().toString();
      await expect(
        createContext({
          mode: 'dev',
          cwd,
        }),
      ).rejects.toThrow('Current working directory');
    });

    test('should create .dir', async () => {
      const ctx = await createContext({
        mode: 'dev',
      });

      expect(ctx.dir.root).toEqual(process.cwd());
      expect(ctx.dir.backyard).toEqual(join(process.cwd(), '.backyard'));
      expect(ctx.dir.source).toEqual(join(process.cwd()));
      expect(ctx.dir.dest).toEqual(join(process.cwd(), '.backyard/dev'));
    });

    test('should add core services', async () => {
      const dev = await createContext({
        mode: 'dev',
      });

      coreServices.forEach((name) => {
        expect(dev.coreServiceSettings[name]).toEqual(
          createDevCoreServiceSettings()[name],
        );
      });

      const build = await createContext({
        mode: 'build',
      });

      coreServices.forEach((name) => {
        expect(build.coreServiceSettings[name]).toEqual(
          createBuildCoreServiceSettings()[name],
        );
      });
    });
  });
});
