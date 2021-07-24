// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsonScalar = string | number | boolean | null | undefined | any;
export type JsonObject = Record<string, JsonScalar>;
export type Json = JsonScalar | JsonObject | JsonScalar[] | JsonObject[];
