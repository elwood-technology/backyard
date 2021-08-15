import { Json } from '@backyard/types';

export type CreateAppAttributes = {
  prompt?: string;
  env: string;
  autofill?: { random?: number; default?: Json };
};

export type BackyardFile = {
  createAppAttributes(): CreateAppAttributes[];
};
