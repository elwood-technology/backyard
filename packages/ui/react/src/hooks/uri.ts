import { useEffect, useState } from 'react';

import { useChannel } from '../channel';

export function useUri(): string {
  const [uri, setUri] = useState('/');
  const channel = useChannel();

  function onMessage(args: { uri: string }): void {
    setUri(args.uri);
  }

  useEffect(() => {
    if (channel) {
      channel.on('uri-change', onMessage);
      return () => {
        channel.off('uri-change', onMessage);
      };
    }
  }, [channel?.guid]);

  return uri;
}
