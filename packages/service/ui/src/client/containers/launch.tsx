import React from 'react';

import { LaunchView } from '../components';
import {
  useLaunchState,
  useAuthzStateServicesWithInterface,
  useBackyardStateWorkspaceLogoUrl,
  useBackyardStateWorkspaceTitle,
} from '../hooks';

import { NotificationsMenu } from './notifications';
import { UserMenu } from './user';
import { SearchBox } from './search';
import { ServiceDisplayName, ServiceIcon } from './service';
import { Activity } from './activity';

export interface LaunchProps {
  showCloseButton?: boolean;
}

export function Launch(props: LaunchProps) {
  const { showCloseButton } = props;
  const { toggleOpen } = useLaunchState();
  const services = useAuthzStateServicesWithInterface();
  const logoUrl = useBackyardStateWorkspaceLogoUrl();
  const title = useBackyardStateWorkspaceTitle();

  const hasNotifications = false;
  const hasActivity = false;

  function onCloseClick() {
    toggleOpen();
  }

  return (
    <LaunchView
      title={title}
      logoUrl={logoUrl}
      onCloseClick={onCloseClick}
      showCloseButton={showCloseButton}
      userMenu={<UserMenu />}
      notificationsMenu={hasNotifications && <NotificationsMenu />}
      searchBox={<SearchBox />}
      activity={hasActivity && <Activity />}
      services={services.map((item) => {
        return [
          item.name,
          <ServiceDisplayName serviceName={item.name} />,
          <ServiceIcon serviceName={item.name} />,
        ];
      })}
    />
  );
}
