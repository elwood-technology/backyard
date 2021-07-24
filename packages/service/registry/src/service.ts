import { join } from 'path';

import type { Context } from '@backyard/types';
import { serviceHasGateway } from '@backyard/common';

export async function stage(dir: string, context: Context): Promise<void> {
  const services = Array.from(context.services)
    .filter(
      ([name, service]) => name !== 'registry' && serviceHasGateway(service),
    )
    .map(([name]) => {
      return {
        name,
        url: `http://localhost:8000/${name}/v1`,
      };
    });

  await context.tools.filesystem.writeAsync(
    join(dir, 'state.json'),
    JSON.stringify({ services }, null, 2),
  );
}
