import { basename } from 'path';
import { randomBytes } from 'crypto';

import { filesystem } from 'gluegun';

import type { Context } from '@backyard/types';

import {
  InfrastructureState,
  EcrTaskDefinition,
  DockerComposeService,
} from '../types';

const IMAGE_NAME = 'supabase/postgres:0.13.0';

function envFromContext(context: Context): Record<string, string> {
  const { db } = context.coreServiceSettings;
  return {
    POSTGRES_DB: db.name,
    POSTGRES_USER: db.user,
    POSTGRES_PASSWORD: db.password,
    POSTGRES_PORT: String(db.port),
  };
}

export function dbDockerCompose(context: Context): DockerComposeService {
  const { db } = context.coreServiceSettings;
  return {
    container_name: 'by-db',
    image: IMAGE_NAME,
    ports: [`${db.port}:${db.port}`],
    command: ['postgres', '-c', 'wal_level=logical'],
    volumes: [`${context.dir.dest}/db/sql:/docker-entrypoint-initdb.d/`],
    environment: envFromContext(context),
  };
}

export function dbInfrastructure(
  context: Context,
  state: InfrastructureState,
): EcrTaskDefinition {
  const { db } = context.coreServiceSettings;

  // const ecr = state.tf.resource('aws_ecr_repository', 'backyard--db-ecr', {
  //   name: 'backyard_db',
  //   image_tag_mutability: 'MUTABLE',
  // });

  // const img = state.tf.module('db_ecr_image', {
  //   source: '/Users/traviskuhl/Repos/backyard/terraform-aws-ecr-image',
  //   dockerfile_dir: join(context.dir.dest, 'db'),
  //   ecr_repository_url: ecr.attr('repository_url'),
  //   aws_profile: state.profile,
  //   aws_region: state.region,
  // });

  return {
    cpu: 1024,
    image: IMAGE_NAME,
    memory: 2048,
    name: 'db',
    networkMode: 'awsvpc',
    logConfiguration: {
      logDriver: 'awslogs',
      options: {
        'awslogs-group': 'BackyardLogGroup',
        'awslogs-region': state.region,
        'awslogs-stream-prefix': 'db',
      },
    },
    environment: Object.entries(envFromContext(context)).map(
      ([name, value]) => {
        return {
          name,
          value,
        };
      },
    ),

    portMappings: [
      {
        containerPort: db.containerPort,
        hostPort: db.port,
      },
    ],
  };
}

export async function dbCreateSqlFiles(
  context: Context,
): Promise<Array<[string, string]>> {
  const localFiles = filesystem
    .find(context.dir.source, {
      matching: ['**/*.sql', '!.backyard/**/*'],
    })
    .map((src) => {
      const name = `${basename(src, '.sql')}-${randomBytes(5).toString(
        'hex',
      )}.sql`;
      return [`db/sql/02-${name}`, filesystem.read(src)];
    }) as Array<[string, string]>;

  return [
    ...localFiles,
    ['db/sql/00-schema.sql', dbSchema(context)],
    ['db/sql/01-auth-schema.sql', dbAuthSchema(context)],
  ];
}

export function dbDockerfile(context: Context): string {
  const { db } = context.coreServiceSettings;

  return `FROM supabase/postgres:0.13.0

COPY sql/ /docker-entrypoint-initdb.d

# Build time defaults
ARG build_POSTGRES_DB=${db.name}
ARG build_POSTGRES_USER=${db.user}
ARG build_POSTGRES_PASSWORD=${db.password}
ARG build_POSTGRES_PORT=${db.containerPort}

# Run time values
ENV POSTGRES_DB=$build_POSTGRES_DB
ENV POSTGRES_USER=$build_POSTGRES_USER
ENV POSTGRES_PASSWORD=$build_POSTGRES_PASSWORD
ENV POSTGRES_PORT=$build_POSTGRES_PORT

EXPOSE ${db.containerPort}`;
}

export function dbSchema(_state: Context): string {
  return `
-- Set up reatime
create publication supabase_realtime for all tables;

-- Extension namespacing
create schema extensions;
create extension if not exists "uuid-ossp"      with schema extensions;
create extension if not exists pgcrypto         with schema extensions;
create extension if not exists pgjwt            with schema extensions;

-- Developer roles
create role anon                nologin noinherit;
create role authenticated       nologin noinherit; -- "logged in" user: web_user, app_user, etc
create role service_role        nologin noinherit bypassrls; -- allow developers to create JWT's that bypass their policies

create user authenticator noinherit;
grant anon              to authenticator;
grant authenticated     to authenticator;
grant service_role      to authenticator;

grant usage                     on schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;`;
}

export function dbAuthSchema(_state: Context): string {
  return `CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION postgres;

-- auth.users definition
CREATE TABLE auth.users (
	instance_id uuid NULL,
	id uuid NOT NULL,
	aud varchar(255) NULL,
	"role" varchar(255) NULL,
	email varchar(255) NULL,
	encrypted_password varchar(255) NULL,
	confirmed_at timestamptz NULL,
	invited_at timestamptz NULL,
	confirmation_token varchar(255) NULL,
	confirmation_sent_at timestamptz NULL,
	recovery_token varchar(255) NULL,
	recovery_sent_at timestamptz NULL,
	email_change_token varchar(255) NULL,
	email_change varchar(255) NULL,
	email_change_sent_at timestamptz NULL,
	last_sign_in_at timestamptz NULL,
	raw_app_meta_data jsonb NULL,
	raw_user_meta_data jsonb NULL,
	is_super_admin bool NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, email);
CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);
-- auth.refresh_tokens definition
CREATE TABLE auth.refresh_tokens (
	instance_id uuid NULL,
	id bigserial NOT NULL,
	"token" varchar(255) NULL,
	user_id varchar(255) NULL,
	revoked bool NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id)
);
CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);
CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);
CREATE INDEX refresh_tokens_token_idx ON auth.refresh_tokens USING btree (token);
-- auth.instances definition
CREATE TABLE auth.instances (
	id uuid NOT NULL,
	uuid uuid NULL,
	raw_base_config text NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	CONSTRAINT instances_pkey PRIMARY KEY (id)
);
-- auth.audit_log_entries definition
CREATE TABLE auth.audit_log_entries (
	instance_id uuid NULL,
	id uuid NOT NULL,
	payload json NULL,
	created_at timestamptz NULL,
	CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id)
);
CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);
-- auth.schema_migrations definition
CREATE TABLE auth.schema_migrations (
	"version" varchar(255) NOT NULL,
	CONSTRAINT schema_migrations_pkey PRIMARY KEY ("version")
);
INSERT INTO auth.schema_migrations (version)
VALUES  ('20171026211738'),
        ('20171026211808'),
        ('20171026211834'),
        ('20180103212743'),
        ('20180108183307'),
        ('20180119214651'),
        ('20180125194653');
-- Gets the User ID from the request cookie
create or replace function auth.uid() returns uuid as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ language sql stable;
-- Gets the User Role from the request cookie
create or replace function auth.role() returns text as $$
  select nullif(current_setting('request.jwt.claim.role', true), '')::text;
$$ language sql stable;
-- Gets the User Email from the request cookie
create or replace function auth.email() returns text as $$
  select nullif(current_setting('request.jwt.claim.email', true), '')::text;
$$ language sql stable;
GRANT ALL PRIVILEGES ON SCHEMA auth TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO postgres;
ALTER ROLE postgres SET search_path = "$user", public, auth;

GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;`;
}

export function dbStorageSchema(): string {
  return `
  CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION postgres;

grant usage on schema storage to postgres, anon, authenticated, service_role;
alter default privileges in schema storage grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema storage grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema storage grant all on sequences to postgres, anon, authenticated, service_role;

DROP TABLE IF EXISTS "storage"."buckets";
CREATE TABLE "storage"."buckets" (
    "id" text not NULL,
    "name" text NOT NULL,
    "owner" uuid,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "buckets_owner_fkey" FOREIGN KEY ("owner") REFERENCES "auth"."users"("id"),
    PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "bname" ON "storage"."buckets" USING BTREE ("name");

DROP TABLE IF EXISTS "storage"."objects";
CREATE TABLE "storage"."objects" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "bucket_id" text,
    "name" text,
    "owner" uuid,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    "last_accessed_at" timestamptz DEFAULT now(),
    "metadata" jsonb,
    CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id"),
    CONSTRAINT "objects_owner_fkey" FOREIGN KEY ("owner") REFERENCES "auth"."users"("id"),
    PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "bucketid_objname" ON "storage"."objects" USING BTREE ("bucket_id","name");
CREATE INDEX name_prefix_search ON storage.objects(name text_pattern_ops);

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION storage.foldername(name text)
 RETURNS text[]
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$function$;

CREATE OR REPLACE FUNCTION storage.filename(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$function$;

CREATE OR REPLACE FUNCTION storage.extension(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	return split_part(_filename, '.', 2);
END
$function$;

CREATE OR REPLACE FUNCTION storage.search(prefix text, bucketname text, limits int DEFAULT 100, levels int DEFAULT 1, offsets int DEFAULT 0)
 RETURNS TABLE (
    name text,
    id uuid,
    updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    metadata jsonb
  )
 LANGUAGE plpgsql
AS $function$
DECLARE
_bucketId text;
BEGIN
    select buckets."id" from buckets where buckets.name=bucketname limit 1 into _bucketId;
	return query
		with files_folders as (
			select ((string_to_array(objects.name, '/'))[levels]) as folder
			from objects
			where objects.name ilike prefix || '%'
			and bucket_id = _bucketId
			GROUP by folder
			limit limits
			offset offsets
		)
		select files_folders.folder as name, objects.id, objects.updated_at, objects.created_at, objects.last_accessed_at, objects.metadata from files_folders
		left join objects
		on prefix || files_folders.folder = objects.name
        where objects.id is null or objects.bucket_id=_bucketId;
END
$function$;

GRANT ALL PRIVILEGES ON SCHEMA storage TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO postgres;
  `;
}
