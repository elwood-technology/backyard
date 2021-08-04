import { join } from 'path';

import { config as dotEnvConfig } from 'dotenv';

import type { ContextMode } from '@backyard/types';
import { createContext } from '@backyard/context';
import { ContextModeLocal } from '@backyard/common';

import type { Toolbox } from '../types';

export default async function context(tools: Toolbox): Promise<void> {
  tools.createContext = async (mode: ContextMode) => {
    const envName = mode === ContextModeLocal ? 'local.env' : 'remove.env';
    const cwd = tools.parameters.options.cwd || process.cwd();

    if (process.env.BACKYARD_ENV_FILE) {
      dotEnvConfig({
        path: process.env.BACKYARD_ENV_FILE,
      });
    }

    if (process.env.BACKYARD_IGNORE_ENV_FILE !== 'true') {
      dotEnvConfig({
        path: join(cwd, envName),
      });
    }

    return (tools.context = await createContext({
      mode,
      cwd,
      log(msg) {
        tools.print.info(msg);
      },
      settings: {},
    }));
  };
}
