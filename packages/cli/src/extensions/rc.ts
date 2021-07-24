import { homedir } from 'os';
import { join } from 'path';

import type { Toolbox } from '../types';

export default async function prepareStage(tools: Toolbox): Promise<void> {
  const { filesystem } = tools;
  const rcDirPath = join(homedir(), '.backyard-rc');
  const rcConfigPath = join(rcDirPath, 'config.json');
  const rcCloudPath = join(rcDirPath, 'cloud.json');

  await filesystem.dirAsync(rcDirPath);

  const config = filesystem.exists(rcConfigPath) ? require(rcConfigPath) : {};
  const cloud = filesystem.exists(rcCloudPath) ? require(rcCloudPath) : {};

  tools.rc = {
    dir: rcDirPath,
    config: {
      ...config,
      file: rcConfigPath,
    },
    cloud: {
      ...cloud,
      file: rcCloudPath,
    },
  };
}
