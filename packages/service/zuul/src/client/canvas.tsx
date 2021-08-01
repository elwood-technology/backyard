import React from 'react';

import '../../style.css';

import { CanvasRoute, CanvasTitle, CanvasShortcuts } from '@backyard/ui-react';

export default function Canvas(): JSX.Element {
  return (
    <>
      <CanvasTitle title="Authorization" />
      <CanvasShortcuts
        shortcuts={[
          {
            id: '1',
            text: 'Hello',
            icon: 'SearchIcon',
            href: '/poop',
          },
        ]}
      />
      <CanvasRoute path="/poop">poop</CanvasRoute>
      <CanvasRoute path="/" exact={true}>
        Home
      </CanvasRoute>
    </>
  );
}
