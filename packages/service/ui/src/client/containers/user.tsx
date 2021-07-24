import React, { MouseEvent } from 'react';

import { useAuthCurrentUser, useAuthSignOut } from '../hooks';

import { UserMenuView, UserMenuViewProps } from '../components';

export function UserMenu(): JSX.Element {
  const user = useAuthCurrentUser();
  const { signOut } = useAuthSignOut();

  async function onSignOutClick(e: MouseEvent) {
    e.preventDefault();
    await signOut();
  }

  const items: UserMenuViewProps['items'] = [
    // {
    //   name: 'Settings',
    //   href: '/settings',
    // },
  ];
  return (
    <UserMenuView
      displayName={user?.email}
      items={items}
      onSignOutClick={onSignOutClick}
    />
  );
}
