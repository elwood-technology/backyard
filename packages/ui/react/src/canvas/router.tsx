import React, { PropsWithChildren, useEffect } from 'react';

import { MemoryRouter, Route, useHistory, useLocation } from 'react-router-dom';

import { useUri } from '../hooks/uri';

function CanvasRouterInner(): JSX.Element {
  const uri = useUri();
  const { push } = useHistory();
  const { pathname } = useLocation();

  useEffect(() => {
    if (uri !== pathname) {
      push(uri);
    }
  }, [uri]);

  return <></>;
}

export function CanvasRouter(props: PropsWithChildren<unknown>): JSX.Element {
  return (
    <MemoryRouter>
      <CanvasRouterInner />
      {props.children}
    </MemoryRouter>
  );
}

export const CanvasRoute = Route;
