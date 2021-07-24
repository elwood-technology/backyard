import React, { PropsWithChildren, useEffect } from 'react';

import { useChannel } from '../channel';

export interface CanvasMenuProps {
  menu: any[];
}

export function CanvasMenu(
  props: PropsWithChildren<CanvasMenuProps>,
): JSX.Element {
  const { children, menu = [] } = props;
  const channel = useChannel();

  useEffect(() => {
    if (menu && channel) {
      channel.sendMessage('set-menu', {
        menu,
      });
    }
  }, [channel?.guid, JSON.stringify(menu)]);

  return <>{children}</>;
}
