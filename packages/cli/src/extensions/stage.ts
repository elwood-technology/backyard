import { join } from 'path';

import type { Toolbox } from '../types';

export default async function prepareStage(tools: Toolbox): Promise<void> {
  tools.prepareStage = async () => {
    const { context } = tools;

    await tools.filesystem.removeAsync(tools.context.dir.stage);
    await tools.filesystem.dirAsync(tools.context.dir.stage);

    for (const [name, service] of context.services) {
      const serviceDir = join(context.dir.stage, name);

      await tools.filesystem.dirAsync(serviceDir);
      await service.stage(serviceDir);
    }
  };
}
