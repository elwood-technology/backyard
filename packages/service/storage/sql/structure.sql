CREATE EXTENSION ltree;

CREATE SCHEMA IF NOT EXISTS "storage" AUTHORIZATION postgres;

CREATE TABLE "storage"."access" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "bucket" text NOT NULL,
  "path" text NOT NULL,
  "folder_tree" LTREE NOT NULL,
  "attributes" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "user_id" uuid NULL REFERENCES "auth"."users" ("id"),
  UNIQUE ("id")
);

CREATE UNIQUE INDEX storage_nodes_idx ON "storage"."nodes" USING btree ("bucket", "uri", "user_id");
