---
id: "modules"
title: "@backyard/context"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Type aliases

### CreateContextArgs

Ƭ **CreateContextArgs**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cwd?` | `string` |
| `initialConfig?` | `Configuration` |
| `log?` | `Context`[``"log"``] |
| `mode` | `ContextMode` |
| `settings?` | `Context`[``"settings"``] |

#### Defined in

create.d.ts:2

## Variables

### coreServiceProviders

• `Const` **coreServiceProviders**: `Record`<`string`, `string`\>

#### Defined in

core-services.d.ts:1

## Functions

### createContext

▸ **createContext**(`args`): `Promise`<`Context`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateContextArgs`](modules.md#createcontextargs) |

#### Returns

`Promise`<`Context`\>

#### Defined in

create.d.ts:9

___

### createDbUriFromContext

▸ **createDbUriFromContext**(`_context`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_context` | `Context` |

#### Returns

`string`

#### Defined in

util.d.ts:2

___

### getBackyardDir

▸ **getBackyardDir**(`config`, `rootDir`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `FullConfiguration` |
| `rootDir` | `string` |

#### Returns

`string`

#### Defined in

create.d.ts:12

___

### getRootDir

▸ **getRootDir**(`config`, `cwd`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `FullConfiguration` |
| `cwd` | `string` |

#### Returns

`string`

#### Defined in

create.d.ts:11

___

### getServiceByName

▸ **getServiceByName**<`Settings`\>(`name`, `context`): `ContextService`<`Settings`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Settings` | extends `ConfigurationServiceSettings`<`Settings`\>`ConfigurationServiceSettings` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `context` | `Context` |

#### Returns

`ContextService`<`Settings`\>

#### Defined in

util.d.ts:3

___

### getSourceDir

▸ **getSourceDir**(`config`, `rootDir`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `FullConfiguration` |
| `rootDir` | `string` |

#### Returns

`string`

#### Defined in

create.d.ts:10
