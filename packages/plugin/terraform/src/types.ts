import {
  TerraformGenerator,
  Function,
  Argument,
  Map,
  Heredoc,
  Data,
  Resource,
  Module,
} from 'terraform-generator';

import { ServiceHookProviderArgs, JsonObject } from '@backyard/types';

export interface TerraformHookArgs extends ServiceHookProviderArgs {
  tf: TerraformGenerator;
  Function: typeof Function;
  Argument: typeof Argument;
  Map: typeof Map;
  Heredoc: typeof Heredoc;
}

export type { TerraformGenerator, Resource, Data } from 'terraform-generator';

export type TerraformAddTypeName = 'resource' | 'data' | 'module';

export type TerraformAddType<T> = T extends 'resource'
  ? Resource
  : T extends 'data'
  ? Data
  : T extends 'module'
  ? Module
  : never;

export type TerraformState = {
  generator: TerraformGenerator;
  resources: Record<string, Resource>;
  modules: Record<string, Module>;
  data: Record<string, Data>;
  Map: typeof Map;
  Heredoc: typeof Heredoc;
  Argument: typeof Argument;
  Function: typeof Function;
  get<T extends TerraformAddTypeName>(
    moduleType: T,
    type: string,
    name: string,
  ): TerraformAddType<T>;
  add<T extends TerraformAddTypeName>(
    moduleType: T,
    type: string,
    name: string | JsonObject,
    args?: JsonObject,
  ): TerraformAddType<T>;
  write(to: string): void;
};
