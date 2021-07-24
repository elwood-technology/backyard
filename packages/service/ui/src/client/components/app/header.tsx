import React, { ReactNode, MouseEventHandler } from 'react';

import { MenuAlt2Icon, ViewGridIcon } from '@heroicons/react/outline';
import {} from '@heroicons/react/solid';

export interface AppHeaderViewProps {
  notificationsMenu?: ReactNode;
  appTitle?: ReactNode;
  userMenu?: ReactNode;
  search?: ReactNode;
  onAppsButtonClick: MouseEventHandler;
  onMenuClick: MouseEventHandler;
  showMenuToggle?: boolean;
}

export function AppHeaderView(props: AppHeaderViewProps): JSX.Element {
  const {
    onAppsButtonClick,
    onMenuClick,
    notificationsMenu,
    appTitle,
    userMenu,
    search,
    showMenuToggle = false,
  } = props;

  return (
    <>
      <div className="flex-1 px-4 flex justify-between align-middle">
        <div className="flex my-3">
          {showMenuToggle && (
            <button className="btn mr-3 " onClick={onMenuClick}>
              <MenuAlt2Icon className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center">
            <h1 className="font-semibold ">{appTitle}</h1>
          </div>
        </div>

        {search && (
          <div className="flex align-middle my-3 px-3">
            <button className="btn mr-3" onClick={onAppsButtonClick}>
              <ViewGridIcon className="w-4 h-4" />
            </button>

            {search}
          </div>
        )}

        <div className="ml-4 flex items-center md:ml-6">
          {notificationsMenu ?? <></>}
          {userMenu ?? <></>}
        </div>
      </div>
    </>
  );
}
