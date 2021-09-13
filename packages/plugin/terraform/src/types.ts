import {
  TerraformGenerator,
  Function,
  Argument,
  Map,
  Heredoc,
  Data,
  Resource,
  Module,
  List,
  Block,
} from 'terraform-generator';

import { ServiceHookProviderArgs, JsonObject } from '@backyard/types';

import { TerraformBlock } from './api/terraform-block';

export interface TerraformHookArgs extends ServiceHookProviderArgs {
  tf: TerraformGenerator;
  Function: typeof Function;
  Argument: typeof Argument;
  Map: typeof Map;
  Heredoc: typeof Heredoc;
}

export type { TerraformGenerator, Resource, Data } from 'terraform-generator';

export type TerraformAddTypeName = 'resource' | 'data' | 'module' | 'provider';

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
  Block: typeof Block;
  List: typeof List;
  Map: typeof Map;
  Heredoc: typeof Heredoc;
  Argument: typeof Argument;
  Function: typeof Function;
  TerraformBlock: typeof TerraformBlock;
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
  addProvider(type: string, args: JsonObject): void;
};

export type TerraformStageDirs = {
  destDir: string;
  dataDir: string;
  backendConfigFile: string;
  backendStateFile: string;
};
