import React, { PropsWithChildren, useEffect } from 'react';

import { useChannel } from '../channel';

export interface CanvasTitleProps {
  title: string;
}

export function CanvasTitle(
  props: PropsWithChildren<CanvasTitleProps>,
): JSX.Element {
  const { children, title } = props;
  const channel = useChannel();

  useEffect(() => {
    if (title && channel) {
      channel.sendMessage('set-display-title', {
        title,
      });
    }
  }, [channel?.guid, title]);

  return <>{children}</>;
}
