import React from 'react';

import { BrowserRouter as Router, Route, useParams } from 'react-router-dom';

import {
  useBackyardState,
  useLaunchStateContext,
  LaunchStateConsumer,
  LaunchStateProvider,
} from '../hooks';

import { AuthProvider, AuthBouncer } from './auth';
import { AuthzProvider } from './authz';
import { ServicesProvider, Services } from './service';
import { Launch } from './launch';

export function Canvas(): JSX.Element {
  const backyardState = useBackyardState();
  const launchStateContext = useLaunchStateContext();

  if (typeof backyardState === 'undefined') {
    return <div>No global "BACKYARD_STATE" variable</div>;
  }

  return (
    <Router>
      <AuthProvider key="auth-provider">
        <AuthBouncer key="auth-bouncer">
          <AuthzProvider key="authz-provider">
            <ServicesProvider>
              <LaunchStateProvider value={launchStateContext}>
                <Route path="/:serviceName?/:path*">
                  <CanvasRoot />
                </Route>
              </LaunchStateProvider>
            </ServicesProvider>
          </AuthzProvider>
        </AuthBouncer>
      </AuthProvider>
    </Router>
  );
}

export function CanvasRoot(): JSX.Element {
  const params = useParams<{ serviceName: string; path?: string }>();

  return (
    <>
      <LaunchStateConsumer>
        {(launchState) =>
          (launchState.open || !params.serviceName) && (
            <Launch showCloseButton={!!params.serviceName} />
          )
        }
      </LaunchStateConsumer>
      <Services {...params} />
    </>
  );
}
