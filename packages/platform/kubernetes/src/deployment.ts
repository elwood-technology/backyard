import yaml from 'yaml';

import type { Deployment } from 'kubernetes-types/apps/v1';
import type { Container } from 'kubernetes-types/core/v1';

import type { ContextService } from '@backyard/types';

export function buildKubernetesDeployment(services: ContextService[]): string {
  const kubernetesConfig: Deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'backyard',
      labels: {
        name: 'by',
      },
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: 'by',
        },
      },
      template: {
        metadata: {
          labels: {
            app: 'by',
          },
        },
        spec: {
          containers: services
            .map((service) => {
              if (!service.container || service.container?.enabled === false) {
                return false;
              }

              return {
                name: service.name,
                image: service.container.imageName,
              };
            })
            .filter(Boolean) as Container[],
        },
      },
    },
  };
  return yaml.stringify(kubernetesConfig);
}
