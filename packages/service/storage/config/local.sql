
INSERT INTO "auth"."users" (
    "instance_id",
    "id",
    "aud",
    "role",
    "email",
    "encrypted_password",
    "confirmed_at",
    "raw_app_meta_data",
    "is_super_admin",
    "created_at",
    "updated_at",
    "last_sign_in_at",
    "confirmation_token",
    "recovery_token",
    "email_change_token",
    "email_change",
    "raw_user_meta_data"
 ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'd8d6b1cd-ad6a-46be-81b2-564df447158b',
    '',
    'authenticated',
    'test@example.com',
    '$2a$10$iTjU3QpieMpw21ia5DQtL.N/pX9QbSX.vKW21FFDoajrQw13Jz0Dy',
    NOW(),
    '{"provider": "email"}',
    false,
    now(),
    now(),
    now(),
    '',
    '',
    '','',
    '{}'
);


INSERT INTO "storage"."access" (
  "bucket",
  "path",
  "folder_tree",
  "user_id"
) VALUES (
  'xx',
  'objects/9f8f979374969429263495ffcaac832cd603b1efe4c66a05fafd6729dffef9af',
  CONCAT_WS('.', MD5('objects'), MD5('9f8f979374969429263495ffcaac832cd603b1efe4c66a05fafd6729dffef9af')),
  'd8d6b1cd-ad6a-46be-81b2-564df447158b'
);



