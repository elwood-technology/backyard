import React, { Fragment, MouseEventHandler } from 'react';

import Avatar from 'react-avatar';
import { Menu, Transition } from '@headlessui/react';

import { classNames } from '../util';

export interface UserMenuViewProps {
  className?: string;
  displayName?: string;
  onSignOutClick: MouseEventHandler;
  items: Array<{
    name: string;
    onClick?: MouseEventHandler;
    href?: string;
  }>;
}

export function UserMenuView(props: UserMenuViewProps): JSX.Element {
  const { items = [], displayName, onSignOutClick } = props;

  return (
    <Menu as="div" className="ml-3 relative">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full">
                <Avatar name={displayName} size="100%" round={true} />
              </div>
            </Menu.Button>
          </div>
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 "
            >
              <div className="py-1">
                <Menu.Item key="LayoutHeaderView-User">
                  <div className="block px-4 py-2 text-sm text-gray-700">
                    Hello <strong>{displayName}</strong>
                  </div>
                </Menu.Item>
              </div>
              {items && (
                <div className="py-1">
                  {items?.map((item) => (
                    <Menu.Item key={`LayoutHeaderView-${item.name}`}>
                      {({ active }) => (
                        <a
                          href={item.href}
                          onClick={item.onClick}
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-gray-700',
                          )}
                        >
                          {item.name}
                        </a>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              )}
              <Menu.Item key="LayoutHeaderView-SignOut">
                {({ active }) => (
                  <a
                    href="#"
                    onClick={onSignOutClick}
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'block px-4 py-2 text-sm text-gray-700 ',
                    )}
                  >
                    Sign Out
                  </a>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
