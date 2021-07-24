import { ServiceRequest, ServiceResponse } from '@backyard/types';

export async function handler(ctx: ServiceRequest): Promise<ServiceResponse> {
  const { backyard } = ctx;
  return {
    body: {
      services: backyard.services,
    },
  };
}
