import { join } from 'path';

import type { ServiceRequest, ServiceResponse } from '@backyard/types';
import { AuthUser } from '../../types';

export async function servicesEndpoint(
  _req: ServiceRequest,
  user: AuthUser,
): Promise<ServiceResponse> {
  const { services } = require(join(process.cwd(), './state.json'));

  return {
    body: {
      services,
      user,
    },
  };
}
