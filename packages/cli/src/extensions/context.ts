import type { ContextMode } from '@backyard/types';
import { createContext } from '@backyard/context';

import type { Toolbox } from '../types';

export default async function context(tools: Toolbox): Promise<void> {
  tools.createContext = async (mode: ContextMode) => {
    const cwd = tools.parameters.options.cwd || process.cwd();

    return (tools.context = await createContext({
      mode,
      cwd,
      log(msg) {
        tools.print.info(msg);
      },
      settings: {},
      only: getOnlyValues(tools.parameters.options.only),
    }));
  };
}

export function getOnlyValues(
  value: string | string[] | undefined,
): string[] | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return getOnlyValues(value.split(','));
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.reduce((acc, curr) => {
    return [...acc, ...curr.split(',')];
  }, [] as string[]);
}
