import { join } from 'path';

import { Configuration } from '@backyard/types';

import { coreServiceProviders } from '../service/core';
import { createContext } from '../create';
import helper from './helpers';

describe('create', () => {
  beforeEach(helper.setCleanTestCwd);
  afterEach(helper.switchBackToCorrectCwd);

  const initialConfig: Configuration = {
    platform: {
      local: join(__dirname, './fixtures/platform.ts'),
      remote: join(__dirname, './fixtures/platform.ts'),
    },
    services: Object.keys(coreServiceProviders).map((name) => {
      return {
        name,
        provider: join(__dirname, './fixtures/service.ts'),
      };
    }),
  };

  describe('#createContext', () => {
    test('should fail if cwd does not exist', async () => {
      const cwd = Math.random().toString();
      await expect(
        createContext({
          mode: 'local',
          cwd,
        }),
      ).rejects.toThrow('Current working directory');
    });

    test('should fail if root does not exist', async () => {
      const cwd = Math.random().toString();
      await expect(
        createContext({
          mode: 'local',
          cwd,
          initialConfig,
        }),
      ).rejects.toThrow('Current working directory');
    });

    test('should create local', async () => {
      const ctx = await createContext({
        mode: 'local',
        initialConfig,
      });

      expect(ctx.dir.root).toEqual(process.cwd());
      expect(ctx.dir.backyard).toEqual(join(process.cwd(), '.backyard'));
      expect(ctx.dir.source).toEqual(join(process.cwd()));
      expect(ctx.dir.stage).toEqual(join(process.cwd(), '.backyard/local'));
    });

    test('should add core services', async () => {
      const local = await createContext({
        mode: 'local',
        initialConfig,
      });

      expect(local.services.has('gateway')).toBeTruthy();
      expect(local.services.has('db')).toBeTruthy();
      expect(local.services.has('auth')).toBeTruthy();
      expect(local.services.has('something')).toBeFalsy();
    });
  });
});
