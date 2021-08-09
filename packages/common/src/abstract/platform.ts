import type { Platform, JsonObject } from '@backyard/types';

export abstract class AbstractPlatform<Options extends JsonObject = JsonObject>
  implements Platform<Options>
{
  protected options: Options = {} as Options;

  async init(): Promise<void> {
    return;
  }

  setOptions(options: Options): void {
    this.options = options;
  }

  getOptions(): Options {
    return this.options;
  }
}
