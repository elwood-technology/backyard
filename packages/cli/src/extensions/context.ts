import type { ContextMode } from '@backyard/types';
import { createContext } from '@backyard/context';

import type { Toolbox } from '../types';

export default async function context(tools: Toolbox): Promise<void> {
  tools.createContext = async (mode: ContextMode) => {
    return (tools.context = await createContext({
      mode,
      cwd: tools.parameters.options.cwd || process.cwd(),
      log(msg) {
        tools.print.info(msg);
      },
      settings: {},
    }));
  };
}
