import React, {
  MouseEvent,
  useState,
  useEffect,
  PropsWithChildren,
  RefObject,
} from 'react';

import { QuestionMarkCircleIcon } from '@heroicons/react/solid';

import { AppView, AppHeaderView, AppNavView } from '../components';
import {
  useLaunchState,
  useAuthzStateServicesWithInterface,
  useServicesStateService,
  useServicesStateContext,
  useServicesStateDispatch,
  userServiceDisplayName,
  useServicesState,
  ServicesStateProvider,
  ServicesStateActionType,
  useBackyardStateWorkspaceLogoUrl,
} from '../hooks';

import { NotificationsMenu } from './notifications';
import { UserMenu } from './user';
import { SearchBox } from './search';
import { JsonObject } from 'packages/types/src/scalar';

type OnMessageArgs = {
  type: ServicesStateActionType;
  payload: JsonObject;
  token: string;
};

export interface BaseServiceProps {
  serviceName: string;
}

export interface ServicesProps extends BaseServiceProps {
  path?: string;
}

export function ServicesProvider(
  props: PropsWithChildren<unknown>,
): JSX.Element {
  const services = useAuthzStateServicesWithInterface();
  const value = useServicesStateContext(
    services.map((item) => {
      return {
        name: item.name,
        shortcuts: [],
      };
    }),
  );

  return (
    <ServicesStateProvider value={value}>
      {props.children}
    </ServicesStateProvider>
  );
}

export function Services(props: ServicesProps): JSX.Element {
  const { serviceName, path: uri } = props;
  const logoUrl = useBackyardStateWorkspaceLogoUrl();
  const { toggleOpen } = useLaunchState();
  const { services } = useServicesState();
  const [isMenuVisible, setMenuVisible] = useState(false);

  function onAppsButtonClick(e: MouseEvent) {
    e.preventDefault();
    toggleOpen();
  }

  function onMenuClick(e: MouseEvent) {
    e.preventDefault();
    setMenuVisible(!isMenuVisible);
  }

  const hasNavigation = false;
  const currentService = services.find((item) => item.name === serviceName);

  const header = currentService && (
    <AppHeaderView
      onMenuClick={onMenuClick}
      onAppsButtonClick={onAppsButtonClick}
      notificationsMenu={hasNavigation && <NotificationsMenu />}
      appTitle={<ServiceDisplayName serviceName={serviceName} />}
      userMenu={<UserMenu />}
      search={<SearchBox />}
      showMenuToggle={(currentService?.menu ?? []).length > 0}
    />
  );

  const nav = serviceName && (
    <AppNavView
      logoUrl={logoUrl}
      serviceName={serviceName}
      onMenuClick={onMenuClick}
      menuVisible={isMenuVisible}
      shortcuts={currentService?.shortcuts ?? []}
    />
  );

  return (
    <AppView header={header} nav={nav}>
      {services.map((service) => {
        return (
          <Service
            key={`Services-Service-${service.name}`}
            serviceName={service.name}
            isActive={service.name === serviceName}
            uri={uri}
          />
        );
      })}
    </AppView>
  );
}

export interface ServiceProps {
  serviceName: string;
  isActive: boolean;
  uri?: string;
}

export function Service(props: ServiceProps): JSX.Element {
  const { serviceName, uri, isActive } = props;

  return (
    <>
      {isActive && <ServiceCanvasFrame serviceName={serviceName} uri={uri} />}
      <ServiceDataFrame serviceName={serviceName} />
    </>
  );
}

export interface ServiceCanvasFrame extends BaseServiceProps {
  uri?: string;
}

export function ServiceCanvasFrame(props: ServiceCanvasFrame): JSX.Element {
  const { uri = '/' } = props;
  const {
    name,
    canvasRef: ref,
    channelExchangeToken,
    channelUrl,
    scriptUrl,
    sendMessage,
  } = useServicesStateService(props.serviceName);
  const dispatch = useServicesStateDispatch();

  useEffect(() => {
    sendMessage('canvas', 'uri-change', {
      uri,
    });
  }, [uri]);

  function onMessage(args: OnMessageArgs) {
    const { type, payload, token } = args;

    console.log('CanvasFrame Inbound: %s', type);

    if (type === 'ready') {
      sendMessage('canvas', 'canvas.render', {
        token: channelExchangeToken,
      });
      return;
    }

    if (token !== channelExchangeToken) {
      return;
    }

    dispatch({
      type,
      payload,
      serviceName: name,
    });
  }

  return (
    <ServiceFrame
      name={name}
      frameRef={ref}
      src={channelUrl}
      className="w-full h-full"
      onMessage={onMessage}
      onLoad={() =>
        sendMessage(
          'canvas',
          'init',
          `<body></body><script src="${scriptUrl}"></script>`,
        )
      }
      onUnload={() => sendMessage('canvas', 'unloading')}
    />
  );
}

export function ServiceDataFrame(props: BaseServiceProps): JSX.Element {
  const {
    name,
    dataRef: ref,
    channelExchangeToken,
    channelUrl,
    scriptUrl,
    sendMessage,
  } = useServicesStateService(props.serviceName);
  const dispatch = useServicesStateDispatch();

  function onMessage(args: OnMessageArgs) {
    const { type, payload, token } = args;
    console.log('DataFrame Inbound: %s', type);

    if (type === 'ready') {
      sendMessage('data', 'data.init', {
        token: channelExchangeToken,
      });
      return;
    }

    if (token !== channelExchangeToken) {
      return;
    }

    dispatch({
      type,
      payload,
      serviceName: name,
    });
  }

  return (
    <ServiceFrame
      name={name}
      frameRef={ref}
      src={channelUrl}
      className="hidden"
      onMessage={onMessage}
      onLoad={() =>
        sendMessage(
          'data',
          'init',
          `<body></body><script src="${scriptUrl}"></script>`,
        )
      }
      onUnload={() => sendMessage('data', 'unloading')}
    />
  );
}

export function ServiceDisplayName(props: BaseServiceProps): JSX.Element {
  const displayName = userServiceDisplayName(props.serviceName);
  return <>{displayName}</>;
}

export function ServiceIcon(_props: BaseServiceProps): JSX.Element {
  return <QuestionMarkCircleIcon />;
}

export interface ServiceFrameProps {
  src?: string;
  name: string;
  className?: string;
  frameRef?: RefObject<HTMLIFrameElement>;
  onMessage(args: OnMessageArgs): void;
  onLoad(): void;
  onUnload(): void;
}

export function ServiceFrame(props: ServiceFrameProps): JSX.Element {
  const { src, name, frameRef, className } = props;

  function onMessage(event: MessageEvent) {
    if (typeof event.data !== 'string') {
      return;
    }

    try {
      props.onMessage(JSON.parse(event.data));
    } catch (err) {
      console.log(err.message);
    }
  }

  function onFrameLoad() {
    setTimeout(() => {
      props.onLoad();
    }, 1);
  }

  useEffect(() => {
    if (frameRef?.current) {
      frameRef.current.addEventListener('load', onFrameLoad);
      window.addEventListener('message', onMessage);

      return function unload() {
        props.onUnload();
        frameRef?.current?.removeEventListener('load', onFrameLoad);
        window.removeEventListener('message', onMessage);
      };
    }
  }, [name]);

  if (!frameRef) {
    return <>no frameRef</>;
  }

  const params = JSON.stringify({
    origin: window.location.origin,
    sharedToken: Math.random(),
  });

  return (
    <iframe
      key={`ServiceFrame-${name}`}
      ref={frameRef}
      src={`${src}#${encodeURIComponent(params)}`}
      className={className}
    />
  );
}
