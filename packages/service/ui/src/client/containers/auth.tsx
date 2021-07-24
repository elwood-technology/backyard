import React, {
  FormEvent,
  PropsWithChildren,
  MouseEvent,
  useState,
} from 'react';
import { Switch, Route } from 'react-router-dom';

import { Json } from '@backyard/types';

import { AuthSignInView, AuthSetupView } from '../components';
import {
  AuthContextProvider,
  useAuthSignIn,
  useAuthAdminCreateUser,
  useAuthContext,
  useAuthState,
  initialAuthState,
} from '../hooks';

export function AuthProvider(props: PropsWithChildren<unknown>): JSX.Element {
  const state = useAuthContext(initialAuthState);

  return (
    <AuthContextProvider value={state}>{props.children}</AuthContextProvider>
  );
}

export function AuthBouncer(props: PropsWithChildren<unknown>): JSX.Element {
  const {} = props;
  const { status } = useAuthState();

  if (status === 'none') {
    return <></>;
  }

  if (status === 'recovering') {
    return <>...</>;
  }

  if (status === 'logged-in') {
    return <>{props.children}</>;
  }

  return (
    <Switch>
      <Route path="/auth/setup">
        <AuthSetup />
      </Route>
      <Route>
        <AuthSignIn />
      </Route>
    </Switch>
  );
}

type AuthSignInProps = {
  email?: string;
  password?: string;
};

export function AuthSignIn(props: AuthSignInProps): JSX.Element {
  const { email, password } = props;
  const { signIn, error } = useAuthSignIn();
  const [credentials, setCredentials] = useState<{
    email?: string;
    password?: string;
  }>({
    email,
    password,
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await signIn(credentials);
  }

  function onChange(field: string, value: Json) {
    setCredentials({
      ...credentials,
      [field]: value,
    });
  }

  function onExternalProviderClick(event: MouseEvent) {
    event.preventDefault();
  }

  return (
    <AuthSignInView
      error={!!error}
      state={credentials}
      onSubmit={onSubmit}
      onChange={onChange}
      onExternalProviderClick={onExternalProviderClick}
    />
  );
}

export function AuthSetup(): JSX.Element {
  const { createUser, error } = useAuthAdminCreateUser();
  const [state, setState] = useState<{
    email: string;
    password: string;
    opToken: string;
  }>({ email: '', password: '', opToken: '' });
  const [showLogin, setShowLogin] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      const user = await createUser(state);

      if (user) {
        setShowLogin(true);
      }
    } catch (_) {
      // no op
    }
  }

  if (showLogin) {
    return <AuthSignIn email={state.email} password={state.password} />;
  }

  function onChange(field: string, value: Json) {
    setState({
      ...state,
      [field]: value,
    });
  }

  return (
    <AuthSetupView error={error} onSubmit={onSubmit} onChange={onChange} />
  );
}
