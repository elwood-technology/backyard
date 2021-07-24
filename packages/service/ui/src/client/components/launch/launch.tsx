import React, { MouseEventHandler, PropsWithChildren, ReactNode } from 'react';

import { Link } from 'react-router-dom';
import { XIcon } from '@heroicons/react/solid';

export interface LaunchViewProps {
  logoUrl: string;
  title: string;
  notificationsMenu?: ReactNode;
  userMenu?: ReactNode;
  searchBox?: ReactNode;
  services?: Array<[string, ReactNode, ReactNode]>;
  activity?: ReactNode;
  showCloseButton?: boolean;
  onCloseClick?: MouseEventHandler;
}

export function LaunchView(
  props: PropsWithChildren<LaunchViewProps>,
): JSX.Element {
  const {
    title,
    logoUrl,
    userMenu,
    notificationsMenu,
    searchBox,
    activity,
    showCloseButton,
    onCloseClick,
    services = [],
  } = props;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col">
      <header className="flex justify-between py-3 px-4">
        <div>
          {showCloseButton && (
            <button onClick={onCloseClick}>
              <XIcon className="w-8 h-8 text-gray-500" />
            </button>
          )}
        </div>
        <div className="flex">
          {notificationsMenu ?? <></>}
          {userMenu ?? <></>}
        </div>
      </header>
      <div className="flex-1 flex flex-col justify-center items-center">
        <img className="mx-auto h-20 w-auto" src={logoUrl} alt={title} />
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
        {searchBox && <div className="w-1/4 mt-6 mb-16">{searchBox}</div>}
        <div
          className="grid gap-12 w-4/6"
          style={{
            maxHeight: '60vh',
            gridTemplateColumns: activity
              ? 'minmax(0,1fr)  minmax(0, 1fr)'
              : '1fr',
          }}
        >
          <div className="object-right">
            <div className="grid grid-cols-5 gap-8 items-end">
              {services.map(([name, displayName, icon]) => {
                return (
                  <div
                    key={`LaunchView-App-${name}-${displayName}`}
                    className=" min-h-0 min-w-0"
                  >
                    <div className="flex items-middle flex-col justify-center items-center">
                      <div className="w-10 text-gray-900">
                        <Link to={`/${name}`}>{icon}</Link>
                      </div>
                      <small className="text-gray-600">
                        <Link to={`/${name}`}>{displayName}</Link>
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {activity && <div className="overflow-auto">{activity}</div>}
        </div>
      </div>
      <div>footer</div>
    </div>
  );
}
