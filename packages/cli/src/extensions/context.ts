import type { GluegunToolbox } from 'gluegun';

import type { ContextMode } from '@backyard/types';
import { createContext } from '@backyard/context';

export default async function context(tools: GluegunToolbox): Promise<void> {
  tools.createContext = async (mode: ContextMode) => {
    return (tools.context = await createContext({
      mode,
      cwd: tools.parameters.options.cwd || process.cwd(),
    }));
  };
}
