import type { Toolbox } from '../types';

export default async function prepareDest(tools: Toolbox): Promise<void> {
  tools.prepareDest = async () => {
    await tools.filesystem.removeAsync(tools.context.dir.dest);
    await tools.filesystem.dirAsync(tools.context.dir.dest);
  };
}
