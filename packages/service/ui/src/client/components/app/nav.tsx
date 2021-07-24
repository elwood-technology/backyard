import React, { MouseEventHandler } from 'react';

import { HomeIcon } from '@heroicons/react/outline';
import { Transition } from '@headlessui/react';

import { Link } from 'react-router-dom';

import type { MenuItem } from '../../types';
import { classNames } from '../util';

export interface AppNavViewProps {
  logoUrl: string;
  serviceName: string;
  menuVisible?: boolean;
  onMenuClick: MouseEventHandler;
  shortcuts?: MenuItem[];
  menu?: MenuItem[];
}

export function AppNavView(props: AppNavViewProps): JSX.Element {
  const {
    logoUrl,
    serviceName,
    shortcuts = [],
    menu: _ = [],
    menuVisible = false,
  } = props;

  const homeItem: MenuItem = {
    id: 'home',
    icon: <HomeIcon />,
    text: 'Home',
    href: `/${serviceName}`,
    current: true,
  };

  const classes = 'flex flex-col transition duration-500 ease-in-out'.split(
    ' ',
  );

  return (
    <div className={classNames(...classes, menuVisible ? 'w-64' : '')}>
      <div className="flex flex-col flex-grow border-r border-gray-200 pb-4 bg-white overflow-y-auto">
        <div className="mt-4 flex-grow flex flex-col">
          <div className="mb-8">
            <img className="mx-auto h-10 w-auto" src={logoUrl} alt="Workflow" />
          </div>
          <div className="relative">
            <Transition
              show={!menuVisible}
              enter="transition-opacity duration-75"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-75"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <nav className="flex-1 px-4 bg-white space-y-1 m-w-10">
                {[homeItem, ...shortcuts].map((item, i) => (
                  <Link
                    key={`LayoutNavView-shortcuts-${item.href}-${item.id}-${i}`}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    )}
                  >
                    <span
                      className={classNames(
                        item.current
                          ? 'text-gray-500'
                          : 'text-gray-400 group-hover:text-gray-500',
                        'flex-shrink-0 h-6 w-6',
                      )}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                  </Link>
                ))}
              </nav>
            </Transition>
            <Transition
              show={menuVisible}
              enter="transition-opacity duration-75"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-75"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <nav className="flex-1 px-4 bg-white absolute top-0 left-0">
                <h2>Document</h2>
              </nav>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  );
}
