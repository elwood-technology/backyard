import { JsonObject } from '@backyard/types';

type Mock = {
  method: 'get' | 'post';
  path: string;
  data: JsonObject;
};

export const mocks: Mock[] = [
  {
    method: 'get',
    path: '/auth/v1/settings',
    data: {
      external: {
        bitbucket: true,
        github: true,
        gitlab: true,
        google: true,
      },
      disable_signup: false,
      autoconfirm: false,
    },
  },
  {
    method: 'post',
    path: '/auth/v1/signup',
    data: {
      id: '11111111-2222-3333-4444-5555555555555',
      email: 'email@example.com',
      confirmation_sent_at: '2016-05-15T20:49:40.882805774-07:00',
      created_at: '2016-05-15T19:53:12.368652374-07:00',
      updated_at: '2016-05-15T19:53:12.368652374-07:00',
    },
  },
  {
    method: 'post',
    path: '/auth/v1/invite',
    data: {
      id: '11111111-2222-3333-4444-5555555555555',
      email: 'email@example.com',
      confirmation_sent_at: '2016-05-15T20:49:40.882805774-07:00',
      created_at: '2016-05-15T19:53:12.368652374-07:00',
      updated_at: '2016-05-15T19:53:12.368652374-07:00',
      invited_at: '2016-05-15T19:53:12.368652374-07:00',
    },
  },
  {
    method: 'post',
    path: '/auth/v1/verify',
    data: {
      access_token: 'jwt-token-representing-the-user',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'a-refresh-token',
    },
  },
  {
    method: 'post',
    path: '/auth/v1/token',
    data: {
      access_token: 'jwt-token-representing-the-user',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'a-refresh-token',
      user: {
        id: '',
        app_metadata: {
          provider: '',
        },
        user_metadata: {},
        aud: 'string',
        confirmation_sent_at: 'string',
        email: 'string',
        created_at: 'string',
        confirmed_at: 'string',
        last_sign_in_at: 'string',
        role: 'string',
        updated_at: 'string',
      },
    },
  },
  {
    method: 'get',
    path: '/auth/v1/user',
    data: {
      id: '11111111-2222-3333-4444-5555555555555',
      email: 'email@example.com',
      confirmation_sent_at: '2016-05-15T20:49:40.882805774-07:00',
      created_at: '2016-05-15T19:53:12.368652374-07:00',
      updated_at: '2016-05-15T19:53:12.368652374-07:00',
    },
  },
  {
    method: 'get',
    path: '/authz/v1/services',
    data: {
      services: [
        {
          name: 'test',
          ui: true,
        },
      ],
    },
  },
];
