import { FastifyRequest } from 'fastify';
import { invariant } from 'ts-invariant';

import { User } from '../types';

export function getUser(req: FastifyRequest): User {
  invariant(req.user, 'Missing User from Request');
  invariant((req.user as User).sub, 'Missing User ID from Request');
  return req.user as User;
}
