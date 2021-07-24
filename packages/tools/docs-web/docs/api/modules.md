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

service/core.d.ts:1

## Functions

### addServiceToContext

▸ **addServiceToContext**(`context`, `config`, `tryToInitialize?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | `Context` |
| `config` | `ConfigurationService` |
| `tryToInitialize?` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Defined in

service/add.d.ts:2

___

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

### createKeys

▸ **createKeys**(`destDir`, `config`): `Context`[``"keys"``]

#### Parameters

| Name | Type |
| :------ | :------ |
| `destDir` | `string` |
| `config` | `Configuration` |

#### Returns

`Context`[``"keys"``]

#### Defined in

create.d.ts:10

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

create.d.ts:14

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

create.d.ts:13

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

create.d.ts:12

___

### loadPlatforms

▸ **loadPlatforms**(`config`): `Context`[``"platforms"``]

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Configuration` |

#### Returns

`Context`[``"platforms"``]

#### Defined in

create.d.ts:11
