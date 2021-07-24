import type { ServiceRequest, ServiceResponse } from '@backyard/types';

export async function handler(_req: ServiceRequest): Promise<ServiceResponse> {
  return {
    type: 'json',
    body: {
      hello: true,
    },
  };
}
