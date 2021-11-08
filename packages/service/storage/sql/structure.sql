CREATE EXTENSION ltree;

CREATE SCHEMA IF NOT EXISTS "storage" AUTHORIZATION postgres;

CREATE TABLE "storage"."buckets" (
  "id" TEXT NOT NULL DEFAULT extensions.uuid_generate_v4()::text,
  "display_name" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "credentials" TEXT NULL,
  "attributes" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  UNIQUE ("id")
);


CREATE TYPE "storage"."access_entity_type" AS ENUM (
  'FILE',
  'FOLDER'
);

CREATE TYPE "storage"."access_permission" AS ENUM (
  'NONE',
  'READ',
  'WRITE'
);

CREATE TABLE "storage"."access" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "entity_type" storage.access_entity_type NOT NULL,
  "bucket_id" text REFERENCES "storage"."buckets" ("id"),
  "path" text NOT NULL,
  "folder_tree" LTREE NULL,
  "attributes" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "user_id" uuid NULL REFERENCES "auth"."users" ("id"),
  "permission" storage.access_permission NOT NULL DEFAULT 'NONE',
  UNIQUE ("id")
);

CREATE UNIQUE INDEX storage_access_idx ON "storage"."access" USING btree ("bucket_id", "path", "user_id");
CREATE INDEX storage_access_folder_tree_idx ON "storage"."access" USING GIST ("folder_tree");

