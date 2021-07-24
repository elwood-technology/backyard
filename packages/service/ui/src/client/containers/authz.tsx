import React, { PropsWithChildren } from 'react';

import { useAuthzContext, AuthzContextProvider } from '../hooks';

export function AuthzProvider(props: PropsWithChildren<unknown>): JSX.Element {
  const value = useAuthzContext();

  if (value[0].fetching) {
    return <>...</>;
  }

  console.log(value[0]);

  if (value[0].error) {
    return <div>{value[0].error.message}</div>;
  }

  return (
    <AuthzContextProvider value={value}>{props.children}</AuthzContextProvider>
  );
}
