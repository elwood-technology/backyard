import React, { PropsWithChildren, useEffect } from 'react';

import { useChannel } from '../channel';

export interface CanvasShortcutsProps {
  shortcuts: any[];
}

export function CanvasShortcuts(
  props: PropsWithChildren<CanvasShortcutsProps>,
): JSX.Element {
  const { children, shortcuts = [] } = props;
  const channel = useChannel();

  useEffect(() => {
    if (shortcuts && channel) {
      channel.sendMessage('set-shortcuts', {
        shortcuts,
      });
    }
  }, [channel?.guid, JSON.stringify(shortcuts)]);

  return <>{children}</>;
}
