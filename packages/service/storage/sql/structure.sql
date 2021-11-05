
CREATE SCHEMA IF NOT EXISTS "stroage" AUTHORIZATION postgres;

CREATE TABLE "stroage"."access" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "bucket" text NOT NULL,
  "path" text NOT NULL,
  "attributes" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "user_id" uuid NULL REFERENCES "auth"."users" ("id"),
  UNIQUE ("id")
);

CREATE UNIQUE INDEX stroage_nodes_idx ON "stroage"."nodes" USING btree ("service", "uri", "user_id");
