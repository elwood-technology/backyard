import fetch from 'node-fetch';

import { invariant } from '@backyard/common';
import type { ServiceRequest, ServiceResponse } from '@backyard/types';

import { AuthUser } from '../types';
import { servicesEndpoint } from './endpoints';

export async function handler(req: ServiceRequest): Promise<ServiceResponse> {
  const { request } = req;
  const { headers } = request;

  if (!headers.authorization) {
    return {
      code: 401,
      body: {
        code: 401,
        message: 'Unauthorized',
      },
    };
  }

  const user = await fetchUserWithAuthHeader(headers.authorization);

  if (!user) {
    return {
      code: 401,
      body: {
        code: 401,
        message: 'Unauthorized',
      },
    };
  }

  switch (request.url) {
    case '/services':
      return await servicesEndpoint(req, user);
    default:
      return {
        type: 'json',
        body: {
          hello: true,
        },
      };
  }
}

export async function fetchUserWithAuthHeader(
  authHeader: string,
): Promise<AuthUser | undefined> {
  try {
    const { AUTH_URL, SERVICE_KEY } = process.env;

    invariant(AUTH_URL, 'Missing "AUTH_URL" env');
    invariant(SERVICE_KEY, 'Missing "SERVICE_KEY" env');

    const url = `${AUTH_URL}/user`;
    const response = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        authorization: authHeader,
      },
    });

    invariant(response.status === 200, 'Invalid credentials');

    return (await response.json()) as AuthUser;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}
