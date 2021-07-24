import { readFileSync } from 'fs';

import type { ServiceRequest, ServiceResponse } from '@backyard/types';

export async function handler(_ctx: ServiceRequest): Promise<ServiceResponse> {
  const { services } = JSON.parse(readFileSync('./state.json').toString());

  return {
    type: 'json',
    body: {
      services,
    },
  };
}
