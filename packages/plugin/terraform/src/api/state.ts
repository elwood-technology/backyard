import {
  TerraformGenerator,
  Map,
  Heredoc,
  Argument,
  Function,
  List,
  Block,
} from 'terraform-generator';

import { JsonObject } from '@backyard/types';

import { TerraformBlock } from './terraform-block';
import {
  TerraformState,
  TerraformAddTypeName,
  TerraformAddType,
} from '../types';

export function addModuleTo<T extends TerraformAddTypeName>(
  state: TerraformState,
  moduleType: T,
  type: string,
  name: string | JsonObject,
  args: JsonObject = {},
): TerraformAddType<T> {
  switch (moduleType) {
    case 'resource':
      return (state.resources[`${type}:${name}`] = state.generator.resource(
        type,
        String(name),
        args,
      )) as TerraformAddType<T>;

    case 'data':
      return (state.data[`${type}:${name}`] = state.generator.data(
        type,
        String(name),
        args,
      )) as TerraformAddType<T>;

    case 'module':
      return (state.modules[`${type}:${name}`] = state.generator.module(
        type,
        name as JsonObject,
      )) as TerraformAddType<T>;
    default:
      throw new Error(
        `Unknown type "${moduleType}" trying to add "${type}:${name}"`,
      );
  }
}

export function getModuleFrom<T extends TerraformAddTypeName>(
  state: TerraformState,
  moduleType: T,
  type: string,
  name: string,
): TerraformAddType<T> {
  const storeName = [type, name].join(':');

  switch (moduleType) {
    case 'resource': {
      if (storeName in state.resources) {
        return state.resources[storeName] as TerraformAddType<T>;
      }

      throw new Error(`Unable to find "resource.${storeName}"`);
    }
    case 'data': {
      if (storeName in state.data) {
        return state.data[storeName] as TerraformAddType<T>;
      }

      throw new Error(`Unable to find "data.${storeName}"`);
    }
    default:
      throw new Error(
        `Unknown module type "${moduleType}" trying to get "${type}:${name}"`,
      );
  }
}

export async function createState(): Promise<TerraformState> {
  const tf = new TerraformGenerator();
  const state: TerraformState = {
    List,
    Map,
    Heredoc,
    Argument,
    Function,
    Block,
    TerraformBlock,
    generator: tf,
    modules: {},
    resources: {},
    data: {},
    addProvider(type: string, args: JsonObject) {
      state.generator.provider(type, args);
    },
    get<T extends TerraformAddTypeName>(
      moduleType: T,
      type: string,
      name: string,
    ) {
      return getModuleFrom(state, moduleType, type, name);
    },
    add<T extends TerraformAddTypeName>(
      moduleType: T,
      type: string,
      name: string | JsonObject,
      args: JsonObject = {},
    ) {
      return addModuleTo<T>(state, moduleType, type, name, args);
    },
    write(dir: string) {
      state.generator.write({
        dir,
        format: true,
      });
    },
  };

  return state;
}
