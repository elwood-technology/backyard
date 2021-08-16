import { randomBytes } from 'crypto';

import {
  Context,
  ConfigurationService,
  ServiceHookProviderArgs,
  JsonObject,
} from '@backyard/types';
import { ContextModeLocal, invariant } from '@backyard/common';

export function config(
  context: Context,
  config: ConfigurationService,
): Partial<ConfigurationService> {
  invariant(
    config.settings?.db,
    'You must provide the name of the database service in settings.db',
  );

  invariant(
    config.settings?.operatorToken,
    'You must provide an operatorToken in settings.operatorToken',
  );

  return {
    settings: {
      operatorToken: randomBytes(100).toString('hex'),
      disableSignUp: context.mode === 'remote',
      externalUrl: 'localhost',
      logLevel: 'DEBUG',
      mailerAutoConfirm: true,
      smtp: {
        host: '',
        port: 0,
        user: '',
        pass: '',
      },
    },
    gateway: {
      enabled: true,
      prefix: config.name,
      stripPath: true,
    },
    container: {
      enabled: true,
      externalPort: 9999,
      port: 9999,
      imageName: 'supabase/gotrue:latest',
      host: context.mode === ContextModeLocal ? config.name : '0.0.0.0',
      environment: {
        GOTRUE_JWT_SECRET:
          '<%= await context.getService("gateway").hook("jwtSecret") %>',
        GOTRUE_JWT_EXP:
          '<%= await context.getService("gateway").hook("jwtExp") %>',
        GOTRUE_JWT_DEFAULT_GROUP_NAME:
          '<%= await context.getService("gateway").hook("jwtGroup") %>',
        GOTRUE_DB_DRIVER: 'postgres',
        DB_NAMESPACE: 'auth',
        API_EXTERNAL_URL: config.settings?.externalUrl ?? 'localhost',
        GOTRUE_API_HOST: '0.0.0.0',
        PORT: String(config.container?.externalPort ?? 9999),
        GOTRUE_SMTP_HOST: config.settings?.smtp?.host ?? '',
        GOTRUE_SMTP_PORT: config.settings?.smtp?.port ?? 0,
        GOTRUE_SMTP_USER: config.settings?.smtp?.user ?? '',
        GOTRUE_SMTP_PASS: config.settings?.smtp?.pass ?? '',
        GOTRUE_DISABLE_SIGNUP: `${config.settings?.disableSignUp ?? false}`,
        GOTRUE_SITE_URL: 'localhost',
        GOTRUE_MAILER_AUTOCONFIRM: String(
          config.settings?.mailerAutoConfirm ?? true,
        ),
        GOTRUE_LOG_LEVEL: config.settings?.logLevel ?? '',
        GOTRUE_OPERATOR_TOKEN: `<%= await context.getService("${config.name}").hook("operatorToken") %>`,
        DATABASE_URL: `<%= await context.getService("${config.settings.db}").hook("uri") %>`,
      },
      meta: {
        dockerCompose: {
          depends_on: [config.settings!.db],
        },
      },
    },
  };
}

export async function operatorToken({
  service,
}: ServiceHookProviderArgs): Promise<string> {
  const { operatorToken } = service.config?.settings || {};
  invariant(operatorToken, 'No operatorToken in gotrue config');
  return operatorToken;
}

export async function sql({
  name,
  service,
}: ServiceHookProviderArgs): Promise<Array<[string, string]>> {
  if (name !== service.config?.settings?.db) {
    return [];
  }

  return [
    [
      '01-auth',
      `CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION postgres;
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
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;`,
    ],
  ];
}

export async function awsEcsContainerTaskDef(
  args: ServiceHookProviderArgs,
): Promise<JsonObject> {
  const { parent, service } = args;

  return {
    ...parent,
    dependsOn: [
      {
        containerName: service.config.settings!.db,
        condition: 'HEALTHY',
      },
    ],
  };
}
