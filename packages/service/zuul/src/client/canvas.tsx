import React from 'react';

import { CanvasRoute, CanvasTitle, CanvasShortcuts } from '@backyard/ui-react';

export default function Canvas(): JSX.Element {
  return (
    <>
      <CanvasTitle title="Hello World 1" />
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
